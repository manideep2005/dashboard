import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const files = [
            "public/ExcelExport_2026_02_26.csv",
            "public/ExcelExport_2026_02_27.csv",
            "public/ExcelExport_2026_02_28.csv"
        ];

        const data: any[] = [];
        const groupedData: Record<string, any[]> = {};
        const groupedStats: Record<string, any> = {};

        let totalEnergy = 0;
        let totalCurrent = 0;
        let totalVoltage = 0;
        let maxPower = 0;
        let count = 0;

        for (const file of files) {
            const csvPath = path.join(process.cwd(), file);
            if (!fs.existsSync(csvPath)) continue;

            const fileContent = fs.readFileSync(csvPath, "utf16le");
            const lines = fileContent.split(/\r?\n/).filter(line => line.trim());

            if (lines.length < 4) continue;

            let datePrefix = "";
            const periodMatch = lines[0].match(/Period:\s*(\d{1,2}\/\d{1,2})/);
            if (periodMatch) {
                datePrefix = periodMatch[1].trim();
            }

            if (!groupedData[datePrefix]) {
                groupedData[datePrefix] = [];
                groupedStats[datePrefix] = {
                    totalEnergy: 0,
                    totalCurrent: 0,
                    totalVoltage: 0,
                    maxPower: 0,
                    count: 0
                };
            }

            for (let i = 3; i < lines.length; i++) {
                const cols = lines[i].split("\t").map(c => c.replace(/"/g, "").trim());

                if (cols[1] === "x" || !cols[1] || cols.length < 15) continue;

                const energy = parseFloat(cols[1]); // kWh
                const current = parseFloat(cols[2]); // A
                const phase1 = parseFloat(cols[9]);
                const phase2 = parseFloat(cols[10]);
                const phase3 = parseFloat(cols[11]);
                const v1 = parseFloat(cols[12]);
                const v2 = parseFloat(cols[13]);
                const v3 = parseFloat(cols[14]);
                const voltage = (v1 + v2 + v3) / 3;

                if (isNaN(energy) || isNaN(current)) continue;

                const timeString = cols[0];

                const activePower = (current * (isNaN(voltage) ? 0 : voltage)) / 1000;

                const entry = {
                    time: `${datePrefix} ${timeString}`,
                    timeOnly: timeString,
                    energy,
                    current,
                    voltage: isNaN(voltage) ? 0 : voltage,
                    v1: isNaN(v1) ? 0 : v1,
                    v2: isNaN(v2) ? 0 : v2,
                    v3: isNaN(v3) ? 0 : v3,
                    phase1: isNaN(phase1) ? 0 : phase1,
                    phase2: isNaN(phase2) ? 0 : phase2,
                    phase3: isNaN(phase3) ? 0 : phase3,
                    activePower
                };

                data.push(entry);
                groupedData[datePrefix].push(entry);

                // Global stats
                totalEnergy = Math.max(totalEnergy, energy);
                totalCurrent += current;
                if (!isNaN(voltage)) totalVoltage += voltage;
                maxPower = Math.max(maxPower, activePower);
                count++;

                // Grouped stats
                groupedStats[datePrefix].totalEnergy = Math.max(groupedStats[datePrefix].totalEnergy, energy);
                groupedStats[datePrefix].totalCurrent += current;
                if (!isNaN(voltage)) groupedStats[datePrefix].totalVoltage += voltage;
                groupedStats[datePrefix].maxPower = Math.max(groupedStats[datePrefix].maxPower, activePower);
                groupedStats[datePrefix].count++;
            }
        }

        const finalGroupedStats: Record<string, any> = {};
        for (const [date, stats] of Object.entries(groupedStats)) {
            finalGroupedStats[date] = {
                totalEnergy: stats.totalEnergy,
                avgCurrent: stats.count > 0 ? stats.totalCurrent / stats.count : 0,
                avgVoltage: stats.count > 0 ? stats.totalVoltage / stats.count : 0,
                peakPower: stats.maxPower
            };
        }

        return NextResponse.json({
            data,
            groupedData,
            stats: {
                totalEnergy,
                avgCurrent: count > 0 ? totalCurrent / count : 0,
                avgVoltage: count > 0 ? totalVoltage / count : 0,
                peakPower: maxPower,
            },
            groupedStats: finalGroupedStats,
            availableDays: Object.keys(groupedData)
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, data: [], stats: { totalEnergy: 0, avgCurrent: 0, avgVoltage: 0, peakPower: 0 } });
    }
}
