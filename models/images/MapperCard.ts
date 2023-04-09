import {
    Image,
    createCanvas,
    loadImage,
    registerFont,
    CanvasRenderingContext2D,
} from "canvas";
import osuApi from "../../modules/osu/fetcher/osuApi";
import { User } from "../../types/user";
import path from "path";
import parseUsergroup from "../../helpers/osu/player/getHighestUsergroup";
import { truncateCanvasText } from "../../helpers/transform/truncateCanvasText";
import parseDate from "../../helpers/text/parseDate";
import { fetchOldestBeatmap } from "../../helpers/osu/player/fetchOldestBeatmap";
import {
    Beatmapset,
    BeatmapsetResponse,
    UserBeatmapetsResponse,
} from "../../types/beatmap";
import config from "../../config.json";
import axios from "axios";

export class MapperCard {
    private user_data!: User | null;
    private user_id;
    private canvas = createCanvas(580, 320);
    private ctx = this.canvas.getContext("2d");
    private beatmapsets;
    private icons: { [key: string]: string } = {
        followers:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087122163808620644/user-solid_1.png",
        subscribers:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087122142967107675/bell-solid_1.png",
        total_mapped:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087773942871244850/map-solid_1.png",
        gd: "https://cdn.discordapp.com/attachments/959908232736952420/1087122243684933662/user-group-solid_1.png",
        ranked: "https://cdn.discordapp.com/attachments/959908232736952420/1087122340829212752/image_7.png",
        nominated:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087122495997493360/thumbs-up-solid_1.png",
        loved: "https://cdn.discordapp.com/attachments/959908232736952420/1087122302979813517/Vector.png",
        pending:
            "https://cdn.discordapp.com/attachments/959908232736952420/1087122453790212096/circle-question-solid_1.png",
        kudosu: "https://cdn.discordapp.com/attachments/959908232736952420/1087416316614426714/Vector_1.png",
    };

    constructor(user_id: string | number, beatmapsets: UserBeatmapetsResponse) {
        this.user_id = user_id;
        this.loadFonts();

        this.beatmapsets = beatmapsets;
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
    }

    private async fetch() {
        const user = await osuApi.fetch.user(this.user_id.toString());

        this.user_data = user.data;

        return user.data;
    }

    async render() {
        await this.fetch();
        if (!this.user_data) return;

        this.loadFonts();

        await this.renderBackground();
        await this.renderFollowersAndSubs();
        await this.renderStats();
        await this.renderRecentBeatmap();
        await this.renderProfile();

        return this.canvas.toBuffer();
    }

    private async renderBackground() {
        return new Promise((resolve, reject) => {
            if (!this.user_data) return reject(new Error("Invalid user data"));

            axios(this.user_data.cover.custom_url || "", {
                responseType: "arraybuffer",
            })
                .then((r) => {
                    loadImage(r.data)
                        .then((image) => {
                            this.fillImage(image);
                            this.renderBackgroundOverlay();
                            resolve(true);
                        })
                        .catch(reject);
                })
                .catch(() => {
                    loadImage(
                        "https://raw.githubusercontent.com/ppy/osu-resources/master/osu.Game.Resources/Textures/Headers/news.png"
                    )
                        .then((image) => {
                            this.fillImage(image);
                            this.renderBackgroundOverlay();
                            resolve(true);
                        })
                        .catch(reject);
                });
        });
    }

    private renderBackgroundOverlay() {
        this.ctx.fillStyle = "#000000dd";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private async renderFollowersAndSubs() {
        if (!this.user_data) return;

        const followersIcon = await loadImage(this.icons.followers);
        const subscribersIcon = await loadImage(this.icons.subscribers);
        const kudosuIcon = await loadImage(this.icons.kudosu);

        this.ctx.beginPath();
        this.ctx.fillStyle = "#292126";
        this.ctx.roundRect(40, 174, 249, 26, 5);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "500 15px Quicksand";

        this.ctx.drawImage(followersIcon, 50, 180);
        this.ctx.drawImage(subscribersIcon, 106, 180);
        this.ctx.drawImage(kudosuIcon, 162, 180);
        this.ctx.fillText("Followers / Subscribers / Kudosu", 40, 143 + 15);

        this.ctx.font = "500 10px Quicksand";
        this.ctx.fillText(
            (this.user_data.follower_count || "0").toLocaleString("en-US"),
            69,
            181 + 10
        );

        this.ctx.fillText(
            (this.user_data.mapping_follower_count || "0").toLocaleString(
                "en-US"
            ),
            126,
            181 + 10
        );

        this.ctx.fillText(
            (this.user_data.kudosu.total || "0").toLocaleString("en-US"),
            185,
            181 + 10
        );

        return true;
    }

    private async renderProfile() {
        if (!this.user_data) return;

        const group = parseUsergroup(this.user_data);

        const image = await loadImage(`https://a.ppy.sh/${this.user_id}`);

        const flag = await loadImage(
            `https://purecatamphetamine.github.io/country-flag-icons/3x2/${(
                this.user_data?.country_code || "br"
            ).toUpperCase()}.svg`
        );

        const positions = {
            with_title: {
                username: {
                    x: 144,
                    y: 58,
                },
                flag: {
                    x: 144,
                    y: 107,
                },
                country: {
                    x: 175,
                    y: 107,
                },
                title: {
                    x: 144,
                    y: 85,
                },
            },
            default: {
                username: {
                    x: 144,
                    y: 70,
                },
                flag: {
                    x: 144,
                    y: 100,
                },
                country: {
                    x: 175,
                    y: 100,
                },
                title: {
                    x: 0,
                    y: 0,
                },
            },
        };

        const ignoreUsergroups = [
            "Nomination Assessment Team",
            "Beatmap Nominators",
            "Global Moderator",
        ];

        this.user_data.title = this.user_data.title || "";

        if (this.user_data.title.includes("/"))
            this.user_data.title = this.user_data.title
                .split("/")
                .filter((v, i) => !ignoreUsergroups.includes(v.trim()))
                .join("/");

        if (
            this.user_data.title &&
            config.ownersOsu.includes(this.user_id.toString())
        )
            this.user_data.title =
                `${this.user_data.title} / AxerBot Developer`.trim();

        if (
            config.ownersOsu.includes(this.user_id.toString()) &&
            !this.user_data.title
        )
            this.user_data.title = "AxerBot Developer";

        if (!this.user_data.profile_colour)
            this.user_data.profile_colour = group.colour as string;

        function getPositions(user: User) {
            if (user.title) return positions.with_title;

            return positions.default;
        }

        this.ctx.fillStyle = this.user_data.title
            ? this.user_data.profile_colour
            : (group.colour as string);
        this.ctx.fillRect(0, 0, 5, this.canvas.height);

        const flag_position = getPositions(this.user_data).flag;
        const username_position = getPositions(this.user_data).username;
        const country_position = getPositions(this.user_data).country;
        const title_position = getPositions(this.user_data).title;

        this.roundedImage(flag_position.x, flag_position.y, 25, 17, 5);
        this.ctx.drawImage(flag, flag_position.x, flag_position.y, 25, 17);
        this.ctx.restore();

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "600 25px Quicksand";
        this.ctx.fillText(
            truncateCanvasText(
                this.ctx,
                this.user_data?.username || "unknown",
                180,
                "25px"
            ),
            username_position.x,
            username_position.y + 25
        );

        this.roundedImage(40, 40, 94, 94, 10);
        this.ctx.drawImage(image, 40, 40, 94, 94);
        this.ctx.restore();

        this.ctx.font = "400 15px Quicksand";
        this.ctx.fillStyle = "#FFFFFF";

        this.ctx.fillText(
            truncateCanvasText(
                this.ctx,
                this.user_data.country.name || "unknown",
                150,
                "15px"
            ),
            country_position.x,
            country_position.y + 15
        );

        if (
            this.user_data.title ||
            config.ownersOsu.includes(this.user_id.toString())
        ) {
            this.ctx.font = "400 15px Quicksand";
            this.ctx.fillStyle =
                this.user_data.profile_colour || (group.colour as string);

            this.ctx.fillText(
                truncateCanvasText(
                    this.ctx,
                    this.user_data.title || "Unknown Title",
                    180,
                    "15px"
                ),
                title_position.x,
                title_position.y + 15
            );
        }

        return true;
    }

    private async renderStats() {
        if (!this.user_data) return false;

        const totalMapsets =
            Number(this.user_data.ranked_and_approved_beatmapset_count) +
            Number(this.user_data.loved_beatmapset_count) +
            Number(this.user_data.pending_beatmapset_count) +
            Number(this.user_data.graveyard_beatmapset_count);

        // row 1
        const row1_data = [
            {
                data: this.user_data.ranked_and_approved_beatmapset_count,
                icon: this.icons.ranked,
            },
            {
                data: this.user_data.loved_beatmapset_count,
                icon: this.icons.loved,
            },
            {
                data: this.user_data.guest_beatmapset_count,
                icon: this.icons.gd,
            },
        ];

        // row 2
        const row2_data = [
            {
                data: totalMapsets,
                icon: this.icons.total_mapped,
            },
            {
                data:
                    this.user_data.pending_beatmapset_count +
                    this.user_data.graveyard_beatmapset_count,
                icon: this.icons.pending,
            },
            {
                data: this.user_data.nominated_beatmapset_count,
                icon: this.icons.nominated,
            },
        ];

        this.ctx.font = "600 15px Quicksand";
        this.ctx.fillStyle = "#ffffff";

        let gap = 43;
        let row1_index = 355;

        for (let i = 0; i < 3; i++) {
            const image = await loadImage(row1_data[i].icon);

            this.ctx.drawImage(image, row1_index, 57);
            this.ctx.fillText(
                row1_data[i].data.toString(),
                image.width + row1_index + 7,
                60 + 15
            );
            row1_index += image.width + gap;
        }

        let row2_index = 355;

        for (let i = 0; i < 3; i++) {
            const image = await loadImage(row2_data[i].icon);

            this.ctx.drawImage(image, row2_index, 98);
            this.ctx.fillText(
                row2_data[i].data.toString(),
                image.width + row2_index + 7,
                100 + 15
            );
            row2_index += image.width + gap;
        }

        this.ctx.font = "500 15px Quicksand";
        this.ctx.fillText("Mapping Age", 355, 141 + 15);

        this.ctx.beginPath();
        this.ctx.fillStyle = "#292126";
        this.ctx.roundRect(355, 173, 184, 27, 5);
        this.ctx.fill();
        this.ctx.closePath();

        const mostOldBeatmap = await fetchOldestBeatmap(this.user_data);

        this.ctx.font = "500 10px Quicksand";
        this.ctx.fillStyle = "#C1ABB6";

        this.ctx.fillText(
            parseDate(
                new Date(
                    new Date().getTime() -
                        new Date(mostOldBeatmap.submitted_date).getTime()
                )
            ),
            363,
            180 + 10
        );

        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "400 15px Quicksand";
        this.ctx.fillText("User Groups", 355, 223 + 15);

        this.ctx.beginPath();
        this.ctx.fillStyle = "#292126";
        this.ctx.roundRect(355, 254, 184, 27, 5);
        this.ctx.fill();
        this.ctx.closePath();

        if (this.user_data.groups?.length == 0 || !this.user_data.groups) {
            this.ctx.fillStyle = "#C1ABB6";
            this.ctx.font = "500 10px Quicksand";

            this.ctx.fillText("None...", 363, 261 + 10);
        } else {
            if (!this.user_data.groups) return true;

            let offset = 363;
            for (const group of this.user_data.groups) {
                const image = await loadImage(
                    group.is_probationary
                        ? this.groups[group.short_name].probationary?.icon || ""
                        : this.groups[group.short_name].icon
                );

                this.ctx.drawImage(image, offset, 259, 16, 16);

                offset += 16 + 5;
            }
        }

        return true;
    }

    private async renderRecentBeatmap() {
        const container = createCanvas(250, 40);
        const containerCtx = container.getContext("2d");

        try {
            const banner = await loadImage(
                this.beatmapsets.data.last.covers.cover
            );

            this.fillImage(banner, containerCtx);
        } catch (e) {
            const banner = await loadImage(
                "https://cdn.discordapp.com/attachments/959908232736952420/1089218606631501824/default-bg.7594e945.png"
            );

            this.fillImage(banner, containerCtx);
        }

        containerCtx.fillStyle = "#00000080";
        containerCtx.fillRect(0, 0, container.width, container.height);

        containerCtx.fillStyle = "#ffffff";
        containerCtx.font = "500 15px Quicksand";

        containerCtx.fillText(
            truncateCanvasText(
                containerCtx,
                this.beatmapsets.data.last.title,
                container.width - 20,
                "15px"
            ),
            10,
            7 + 15
        );

        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "400 15px Quicksand";
        this.ctx.fillText("Latest Beatmap", 40, 209 + 16);

        containerCtx.fillStyle = "#BFBFBF";
        containerCtx.font = "400 10px Quicksand";

        containerCtx.fillText(
            truncateCanvasText(
                containerCtx,
                this.beatmapsets.data.last.artist,
                container.width - 20,
                "15px"
            ),
            10,
            22 + 10
        );

        const buffer = container.toBuffer();
        const image = await loadImage(buffer);

        this.roundedImage(40, 240, container.width, container.height, 10);
        this.ctx.drawImage(image, 40, 240, container.width, container.height);
        this.ctx.restore();

        return true;
    }

    private get groups() {
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

    private roundedImage(
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
        );
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.clip();
    }

    private fillImage(img: Image, ctx?: CanvasRenderingContext2D) {
        !ctx ? (ctx = this.ctx) : ctx;

        // get the scale
        var scale = Math.max(
            this.canvas.width / img.width,
            this.canvas.height / img.height
        );
        // get the top left position of the image
        var x = this.canvas.width / 2 - (img.width / 2) * scale;
        var y = this.canvas.height / 2 - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
}
