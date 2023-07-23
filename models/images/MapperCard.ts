import axios from "axios";
import {
    Canvas,
    CanvasRenderingContext2D,
    createCanvas,
    Image,
    loadImage,
    registerFont,
} from "canvas";
import path from "path";
import parseDate from "../../helpers/text/parseDate";
import { truncateCanvasText } from "../../helpers/transform/truncateCanvasText";
import { fetchOldestBeatmap } from "../../modules/osu/player/fetchOldestBeatmap";
import parseUsergroup from "../../modules/osu/player/getHighestUsergroup";
import { Beatmapset, UserBeatmapetsResponse } from "../../types/beatmap";
import { User, UserGroup } from "../../types/user";

interface IndexableUsergroup extends UserGroup {
    index: number;
}

export class MapperCard {
    private beatmaps: UserBeatmapetsResponse;
    public mapper: User;
    private canvas: Canvas;
    private ctx: CanvasRenderingContext2D;

    // images
    private defaultCover =
        "https://raw.githubusercontent.com/ppy/osu-resources/master/osu.Game.Resources/Textures/Headers/news.png";
    private defaultAvatar = "https://a.ppy.sh/0";
    private icons = {
        followers:
            "https://media.discordapp.net/attachments/1132790597099462746/1132790657732317204/bell.png",
        subscribers:
            "https://media.discordapp.net/attachments/1132790597099462746/1132790657732317204/bell.png",
        total_mapped:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087773942871244850/map-solid_1.png",
        gd: "https://cdn.discordapp.com/attachments/959908232736952420/1087122243684933662/user-group-solid_1.png",
        ranked: "https://cdn.discordapp.com/attachments/959908232736952420/1087122340829212752/image_7.png",
        nominated:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087122495997493360/thumbs-up-solid_1.png",
        loved: "https://cdn.discordapp.com/attachments/959908232736952420/1087122302979813517/Vector.png",
        pending:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087122453790212096/circle-question-solid_1.png",
        kudosu: "https://media.discordapp.net/attachments/1132790597099462746/1132790657459703889/kudosu.png",
        playcount:
            "https://media.discordapp.net/attachments/1132790597099462746/1132790657971388456/plays.png",
        favorited:
            "https://media.discordapp.net/attachments/1132790597099462746/1132790658218872872/favorited.png",
    };

    // colors
    private brownDark = "#131112";
    private brownMedium = "#292126";
    private brownLight = "#41373D";
    private brownExtraLight = "#C1ABB6";
    private coverOverlayColour = "#000000bb";
    private white = "#ffffff";

    constructor(mapper: User, beatmaps: UserBeatmapetsResponse) {
        this.mapper = mapper;
        this.beatmaps = beatmaps;

        this.canvas = createCanvas(480, 625);
        this.ctx = this.canvas.getContext("2d", {
            alpha: true,
        });

        this.ctx.textBaseline = "top";

        this.loadFonts();
    }

    private get usergroupIcons() {
        return {
            PPY: {
                index: 0,
                name: "peppy",
                icon: "https://media.discordapp.net/attachments/959908232736952420/1037830827784020111/ppy.png",
                colour: "#0066FF",
            },
            SPT: {
                index: 1,
                name: "Support Team",
                icon: "https://media.discordapp.net/attachments/950107895754784908/953775607395807242/spt.png",
                colour: "#ebd047",
            },
            DEV: {
                index: 2,
                name: "Developer",
                icon: "https://media.discordapp.net/attachments/950107895754784908/953774037790769182/dev.png",
                colour: "#eb47d0",
            },
            GMT: {
                index: 3,
                name: "Global Moderator",
                icon: "https://media.discordapp.net/attachments/941102492857557023/948649173396361226/gmt.png",
                colour: "#99eb47",
            },
            NAT: {
                index: 4,
                name: "Nomination Assessment Team",
                icon: "https://media.discordapp.net/attachments/941102492857557023/948649173794832414/nat2.png",
                colour: "#eb8c47",
            },
            FA: {
                index: 5,
                name: "Featured Artist",
                colour: "#00ffff",
                icon: "https://media.discordapp.net/attachments/950107895754784908/1000854297745043506/fa.png",
            },
            BN: {
                index: 6,
                name: "Beatmap Nominator",
                icon: "https://media.discordapp.net/attachments/941102492857557023/948649173199249438/bn2.png",
                probationary: {
                    name: "Beatmap Nominator (Probationary)",
                    icon: "https://media.discordapp.net/attachments/941102492857557023/948649173983592548/probo.png",
                    colour: "#d6c8fc",
                },
                elite: {
                    name: "Elite Nominator",
                    icon: "https://media.discordapp.net/attachments/941102492857557023/991137703288635462/bn22.png",
                    colour: "#ffc05b",
                },
            },
            ALM: {
                index: 7,
                name: "Alumni",
                icon: "https://media.discordapp.net/attachments/941102492857557023/948649174197489694/alm.png",
                colour: "#999999",
            },
            LVD: {
                index: 8,
                name: "Project Loved",
                icon: "https://media.discordapp.net/attachments/941102492857557023/948649173576740915/lvd.png",
                colour: "#ffd1dc",
            },
            BSC: {
                index: 9,
                name: "Beatmap Spotlight Curator",
                icon: "https://media.discordapp.net/attachments/959908232736952420/1037829623142174811/bsc.png",
                colour: "#76AEBC",
            },
            BOT: {
                index: 10,
                name: "BOT",
                colour: "#ffffff",
                icon: "https://media.discordapp.net/attachments/865037717590245436/955965426964258906/bot.png",
            },
        } as {
            [key: string]: {
                index: number;
                name: string;
                icon: string;
                probationary?: {
                    name: string;
                    icon: string;
                    colour: string;
                };
                elite?: {
                    name: string;
                    icon: string;
                    colour: string;
                };
            };
        };
    }

    private loadFonts() {
        registerFont(path.resolve("./assets/fonts/quicksandL.ttf"), {
            family: "Quicksand",
            weight: "300",
        });

        registerFont(path.resolve("./assets/fonts/quicksandR.ttf"), {
            family: "Quicksand",
            weight: "400",
        });

        registerFont(path.resolve("./assets/fonts/quicksandM.ttf"), {
            family: "Quicksand",
            weight: "500",
        });

        registerFont(path.resolve("./assets/fonts/quicksandSB.ttf"), {
            family: "Quicksand",
            weight: "600",
        });

        registerFont(path.resolve("./assets/fonts/quicksandB.ttf"), {
            family: "Quicksand",
            weight: "700",
        });
    }

    private hasRankedOrLoved() {
        return (
            this.mapper.ranked_and_approved_beatmapset_count != 0 ||
            this.mapper.loved_beatmapset_count != 0
        );
    }

    private hasPending() {
        return this.mapper.pending_beatmapset_count != 0;
    }

    private fillImage(
        img: Image,
        {
            width,
            height,
            x,
            y,
            overlapHeight,
            overlapWidth,
            overlapX,
            overlapY,
        }: {
            width?: number;
            height?: number;
            x?: number;
            y?: number;
            overlapWidth?: boolean;
            overlapHeight?: boolean;
            overlapX?: boolean;
            overlapY?: boolean;
        }
    ) {
        const scale = Math.max(
            (width || this.canvas.width) / img.width,
            (height || this.canvas.height) / img.height
        );

        const finalX = (width || this.canvas.width) / 2 - (img.width / 2) * scale;
        const finalY = (height || this.canvas.height) / 2 - (img.height / 2) * scale;
        const finalWidth = img.width * scale;
        const finalHeight = img.height * scale;

        this.ctx.drawImage(
            img,
            overlapX ? x || finalX : finalX,
            overlapY ? y || finalY : finalY,
            overlapWidth ? width || finalWidth : finalWidth,
            overlapHeight ? height || finalHeight : finalHeight
        );
    }

    private renderAndCenterImageX(image: Image, y: number, targetHeight: number) {
        const scale = Math.max(this.canvas.width / image.width, targetHeight / image.height);

        this.ctx.drawImage(
            image,
            this.canvas.width / 2 - (image.width * scale) / 2,
            y,
            image.width * scale,
            targetHeight
        );
    }

    private fetchImageOrFallbackTo(
        imageUrl: string | undefined | null,
        fallbackImage: string
    ): Promise<Image> {
        return new Promise(async (resolve) => {
            try {
                const coverImage = await axios(imageUrl || fallbackImage, {
                    responseType: "arraybuffer",
                });

                return resolve(loadImage(coverImage.data));
            } catch (e) {
                const coverImage = await axios(fallbackImage, {
                    responseType: "arraybuffer",
                });

                return resolve(loadImage(coverImage.data));
            }
        });
    }

    private drawRoundedImage(
        image: Image,
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number
    ) {
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + w - radius, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        this.ctx.lineTo(x + w, y + h - radius);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        this.ctx.lineTo(x + radius, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();

        this.ctx.clip();

        this.ctx.drawImage(image, x, y, w, h);

        this.ctx.restore();
    }

    private renderBackground() {
        const positions = [0, 0];
        const sizing = [this.canvas.width, this.canvas.height];

        this.ctx.fillStyle = this.brownDark;
        this.ctx.fillRect(positions[0], positions[1], sizing[0], sizing[1]);

        return true;
    }

    private async renderCover() {
        const sizing = [480, 185];

        const coverImage = await this.fetchImageOrFallbackTo(
            this.mapper.cover.custom_url,
            this.defaultCover
        );

        this.renderAndCenterImageX(coverImage, 0, sizing[1]);

        this.ctx.fillStyle = this.coverOverlayColour;
        this.ctx.fillRect(0, 0, sizing[0], sizing[1]);

        this.renderUserTypeBar();

        return true;
    }

    private renderUserTypeBar() {
        const positions = [0, 0];
        const sizing = [5, 185];

        this.ctx.fillStyle =
            this.mapper.profile_colour || (parseUsergroup(this.mapper).colour as string);

        this.ctx.fillRect(positions[0], positions[1], sizing[0], sizing[1]);

        return true;
    }

    private async renderUser() {
        const avatarSizing = [100, 100];
        const avatarPosition = [30, 38];

        const avatarImage = await this.fetchImageOrFallbackTo(
            this.mapper.avatar_url,
            this.defaultAvatar
        );

        this.drawRoundedImage(
            avatarImage,
            avatarPosition[0],
            avatarPosition[1],
            avatarSizing[0],
            avatarSizing[1],
            10
        );

        const usernameSizing = ["30px"];
        const usernamePosition = [150, 50];
        const usernameMaxWidth = this.canvas.width - usernamePosition[0] * 1.6;

        this.ctx.fillStyle = this.white;
        this.ctx.font = `600 ${usernameSizing} Quicksand, sans-serif`;
        this.ctx.fillText(
            truncateCanvasText(this.ctx, this.mapper.username, usernameMaxWidth, usernameSizing[0]),
            usernamePosition[0],
            usernamePosition[1]
        );

        const usergroup = parseUsergroup(this.mapper);

        // ? ========== User title
        if (this.mapper.title) {
            const userTitlePosition = [150, 85];
            const userTitleSizing = ["20px"];
            const userTitleMaxWidth = this.canvas.width - userTitlePosition[0] * 1.6;

            this.ctx.fillStyle = this.mapper.profile_colour || (usergroup.colour as string);
            this.ctx.font = `500 ${userTitleSizing} Quicksand, sans-serif`;

            this.ctx.fillText(
                truncateCanvasText(
                    this.ctx,
                    this.mapper.title,
                    userTitleMaxWidth,
                    userTitleSizing[0]
                ),
                userTitlePosition[0],
                userTitlePosition[1]
            );
        }

        // ? ========== Country and flag
        const countryFlag = await this.fetchImageOrFallbackTo(
            `https://purecatamphetamine.github.io/country-flag-icons/3x2/${this.mapper.country.code}.svg`,
            "https://raw.githubusercontent.com/ppy/osu-web/master/public/images/flags/fallback.png"
        );

        const flagPosition = [150, 90];
        const flagSizing = [35, 25];
        const countryNamePosition = [195, 91];
        const countryNameSizing = ["17px"];
        const countryNameMaxWidth = this.canvas.width - countryNamePosition[0] * 1.6;

        if (this.mapper.title) {
            flagPosition[1] = 113;
            countryNamePosition[1] = 115;
        }

        this.drawRoundedImage(
            countryFlag,
            flagPosition[0],
            flagPosition[1],
            flagSizing[0],
            flagSizing[1],
            5
        );

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = `300 ${countryNameSizing} Quicksand, sans-serif`;
        this.ctx.fillText(
            truncateCanvasText(
                this.ctx,
                this.mapper.country.name,
                countryNameMaxWidth,
                countryNameSizing[0]
            ),
            countryNamePosition[0],
            countryNamePosition[1]
        );
    }

    private async renderStatistics() {
        const userStatisticsBackroundSizing = [this.canvas.width, 105];
        const userStatisticsBackroundPosition = [0, 185];

        this.ctx.fillStyle = this.brownMedium;
        this.ctx.fillRect(
            userStatisticsBackroundPosition[0],
            userStatisticsBackroundPosition[1],
            userStatisticsBackroundSizing[0],
            userStatisticsBackroundSizing[1]
        );

        const totalMapped =
            this.mapper.ranked_and_approved_beatmapset_count +
            this.mapper.loved_beatmapset_count +
            this.mapper.pending_beatmapset_count +
            this.mapper.graveyard_beatmapset_count;

        const iconsPosition = [
            [30, 95, 160, 30, 95, 160],
            [207, 209, 209, 250, 248, 245],
        ]; // x,y

        const textPositions = [
            [60, 124, 190, 60, 124, 190],
            [210, 210, 210, 250, 250, 250],
        ]; // x,y

        const textSizing = ["15px"];

        const iconsData = [
            { icon: this.icons.ranked, data: this.mapper.ranked_and_approved_beatmapset_count },
            { icon: this.icons.loved, data: this.mapper.loved_beatmapset_count },
            { icon: this.icons.gd, data: this.mapper.guest_beatmapset_count },
            { icon: this.icons.total_mapped, data: totalMapped },
            {
                icon: this.icons.pending,
                data: this.mapper.pending_beatmapset_count + this.mapper.graveyard_beatmapset_count,
            },
            { icon: this.icons.nominated, data: this.mapper.nominated_beatmapset_count },
        ];

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = `500 ${textSizing} Quicksand, sans-serif`;

        for (let i = 0; i < iconsData.length; i++) {
            const icon = await loadImage(iconsData[i].icon);
            this.ctx.drawImage(icon, iconsPosition[0][i], iconsPosition[1][i]);

            this.ctx.fillText(
                iconsData[i].data.toString(),
                textPositions[0][i],
                textPositions[1][i]
            );
        }

        if (this.mapper.groups) {
            let iconXPosition = 426;
            const iconYPosition = 210;

            const usergroups = this.mapper.groups.map((group: any) => {
                group.index = this.usergroupIcons[group.short_name].index;

                return group;
            }) as unknown as IndexableUsergroup[];

            usergroups.sort((a, b) => b.index - a.index);

            for (const group of usergroups) {
                const icon = this.usergroupIcons[group.short_name];

                if (icon) {
                    const iconImage = await loadImage(
                        group.is_probationary ? (icon.probationary?.icon as string) : icon.icon
                    );

                    this.ctx.drawImage(iconImage, iconXPosition, iconYPosition, 24, 24);

                    iconXPosition -= 34;
                }
            }
        }
    }

    private async renderMappingAge() {
        this.ctx.fillStyle = this.brownLight;
        this.ctx.fillRect(0, 290, this.canvas.width, 36);

        const oldestBeatmap = await fetchOldestBeatmap(this.mapper);

        const age = parseDate(
            new Date(new Date().getTime() - new Date(oldestBeatmap.submitted_date).getTime())
        );

        const baseText = "mapping for";

        this.ctx.fillStyle = this.brownExtraLight;
        this.ctx.font = `500 15px Quicksand, sans-serif`;
        this.ctx.fillText(baseText, 30, 298);

        this.ctx.fillStyle = this.white;
        this.ctx.font = `700 15px Quicksand, sans-serif`;
        this.ctx.fillText(age, 122, 298);
    }

    private async renderMappingNumbers() {
        const squaresPosition = [
            [29, 137, 245, 353],
            [352, 352, 352, 352],
        ];

        const squaresTextPosition = [
            [71, 183, 290, 395],
            [361, 361, 361, 361],
        ];

        const squaresSize = [98, 36];

        const squareImages = [
            await loadImage(this.icons.playcount),
            await loadImage(this.icons.favorited),
            await loadImage(this.icons.kudosu),
            await loadImage(this.icons.subscribers),
        ];

        const squareImagesPosition = [
            [45, 153, 259, 368],
            [360, 362, 360, 361],
        ];

        const squaresData = [
            this.beatmaps.data.sets_playcount,
            this.beatmaps.data.sets_favourites,
            this.mapper.kudosu.total,
            this.mapper.mapping_follower_count || 0,
        ];

        this.ctx.font = `500 15px Quicksand, sans-serif`;

        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.fillStyle = this.brownMedium;

            this.ctx.roundRect(
                squaresPosition[0][i],
                squaresPosition[1][i],
                squaresSize[0],
                squaresSize[1],
                5
            );
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.drawImage(
                squareImages[i],
                squareImagesPosition[0][i],
                squareImagesPosition[1][i]
            );

            this.ctx.fillStyle = this.white;

            const squareText = Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 1,
            }).format(squaresData[i]);

            this.ctx.fillText(squareText, squaresTextPosition[0][i], squaresTextPosition[1][i]);
        }
    }

    private async renderRecentBeatmaps() {
        const beatmapsetDisplayersPosition = [
            [30, 446],
            [30, 546],
        ];

        const beatmapDisplayerSize = [421, 47];

        this.ctx.font = `500 15px Quicksand, sans-serif`;
        this.ctx.fillStyle = this.white;

        this.ctx.fillText("Latest Pending", 30, 414);

        if (this.hasPending()) {
            await this.renderBeatmapDisplayerAt(
                beatmapsetDisplayersPosition[0][0],
                beatmapsetDisplayersPosition[0][1],
                beatmapDisplayerSize[0],
                beatmapDisplayerSize[1],
                10,
                this.beatmaps.data.last
            );
        } else {
            this.ctx.beginPath();

            this.ctx.fillStyle = this.brownMedium;

            this.ctx.roundRect(
                beatmapsetDisplayersPosition[0][0],
                beatmapsetDisplayersPosition[0][1],
                beatmapDisplayerSize[0],
                beatmapDisplayerSize[1],
                5
            );

            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.fillStyle = this.brownExtraLight;
            this.ctx.fillText("None...", 206, 461);
        }

        this.ctx.font = `500 15px Quicksand, sans-serif`;
        this.ctx.fillStyle = this.white;

        this.ctx.fillText("Latest Ranked/Loved", 30, 514);

        if (this.hasRankedOrLoved()) {
            const lastQualifiedBeatmap = this.beatmaps.data.sets
                .filter((map) => map.ranked_date)
                .sort(
                    (a, b) =>
                        new Date(b.ranked_date as string).valueOf() -
                        new Date(a.ranked_date as string).valueOf()
                );

            await this.renderBeatmapDisplayerAt(
                beatmapsetDisplayersPosition[1][0],
                beatmapsetDisplayersPosition[1][1],
                beatmapDisplayerSize[0],
                beatmapDisplayerSize[1],
                10,
                lastQualifiedBeatmap[0]
            );
        } else {
            this.ctx.beginPath();

            this.ctx.fillStyle = this.brownMedium;

            this.ctx.roundRect(
                beatmapsetDisplayersPosition[1][0],
                beatmapsetDisplayersPosition[1][1],
                beatmapDisplayerSize[0],
                beatmapDisplayerSize[1],
                5
            );

            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.fillStyle = this.brownExtraLight;
            this.ctx.fillText("None...", 206, 461);
        }
    }

    private async renderBeatmapDisplayerAt(
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number,
        beatmap: Beatmapset
    ) {
        const beatmapCover = await this.fetchImageOrFallbackTo(
            beatmap.covers["slimcover@2x"],
            this.defaultCover
        );

        this.drawRoundedImage(beatmapCover, x, y, w, h, radius);

        this.ctx.beginPath();
        this.ctx.fillStyle = "#00000090";
        this.ctx.roundRect(x, y, w, h, radius);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.fillStyle = this.white;
        this.ctx.font = "600 15px Quicksand, sans-serif";
        this.ctx.fillText(
            truncateCanvasText(this.ctx, beatmap.title, w - 10, this.ctx.font),
            x + 10,
            y + 7.5
        );

        this.ctx.font = "400 15px Quicksand, sans-serif";
        this.ctx.fillText(
            truncateCanvasText(this.ctx, beatmap.artist, w - 10, this.ctx.font),
            x + 10,
            y + 25
        );

        return true;
    }

    public async render() {
        this.renderBackground();
        await this.renderCover();
        await this.renderUser();
        await this.renderStatistics();
        await this.renderMappingAge();
        await this.renderMappingNumbers();
        await this.renderRecentBeatmaps();

        return this.canvas.toBuffer();
    }
}
