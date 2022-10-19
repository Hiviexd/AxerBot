import { NominationReset } from "../../../../types/qat";

export default function parseResets(dqs: NominationReset[], pops: NominationReset[]): string {
    let resets = [];
    if (dqs.length || pops.length) {
        if (dqs.length) resets.push(`💔 ${dqs.length}`);
        if (pops.length) resets.push(`🗯️ ${pops.length}`);
        return resets.join(", ");
    } else {
        return "🔄 0";
    }
}
