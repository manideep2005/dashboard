export interface PollutantBreakpoint {
    cLow: number;
    cHigh: number;
    iLow: number;
    iHigh: number;
}

// All concentrations are expected in μg/m³ except where noted.

const PM25_BREAKPOINTS: PollutantBreakpoint[] = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

const PM10_BREAKPOINTS: PollutantBreakpoint[] = [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 504, iLow: 301, iHigh: 400 },
    { cLow: 505, cHigh: 604, iLow: 401, iHigh: 500 },
];

const O3_BREAKPOINTS: PollutantBreakpoint[] = [
    { cLow: 0, cHigh: 106, iLow: 0, iHigh: 50 },
    { cLow: 107, cHigh: 137, iLow: 51, iHigh: 100 },
    { cLow: 138, cHigh: 167, iLow: 101, iHigh: 150 },
    { cLow: 168, cHigh: 206, iLow: 151, iHigh: 200 },
    { cLow: 207, cHigh: 392, iLow: 201, iHigh: 300 },
    { cLow: 393, cHigh: 1000, iLow: 301, iHigh: 500 },
];

const NO2_BREAKPOINTS: PollutantBreakpoint[] = [
    { cLow: 0, cHigh: 100, iLow: 0, iHigh: 50 },
    { cLow: 101, cHigh: 188, iLow: 51, iHigh: 100 },
    { cLow: 189, cHigh: 677, iLow: 101, iHigh: 150 },
    { cLow: 678, cHigh: 1220, iLow: 151, iHigh: 200 },
    { cLow: 1221, cHigh: 2350, iLow: 201, iHigh: 300 },
    { cLow: 2351, cHigh: 4000, iLow: 301, iHigh: 500 },
];

const SO2_BREAKPOINTS: PollutantBreakpoint[] = [
    { cLow: 0, cHigh: 92, iLow: 0, iHigh: 50 },
    { cLow: 93, cHigh: 197, iLow: 51, iHigh: 100 },
    { cLow: 198, cHigh: 485, iLow: 101, iHigh: 150 },
    { cLow: 486, cHigh: 797, iLow: 151, iHigh: 200 },
    { cLow: 798, cHigh: 1585, iLow: 201, iHigh: 300 },
    { cLow: 1586, cHigh: 3000, iLow: 301, iHigh: 500 },
];

const CO_BREAKPOINTS: PollutantBreakpoint[] = [
    { cLow: 0, cHigh: 5060, iLow: 0, iHigh: 50 },
    { cLow: 5061, cHigh: 10810, iLow: 51, iHigh: 100 },
    { cLow: 10811, cHigh: 14260, iLow: 101, iHigh: 150 },
    { cLow: 14261, cHigh: 17710, iLow: 151, iHigh: 200 },
    { cLow: 17711, cHigh: 34960, iLow: 201, iHigh: 300 },
    { cLow: 34961, cHigh: 60000, iLow: 301, iHigh: 500 },
];

function calculateSubIndex(concentration: number, breakpoints: PollutantBreakpoint[]): number {
    if (concentration < 0 || isNaN(concentration)) return 0;

    for (const bp of breakpoints) {
        if (concentration >= bp.cLow && concentration <= bp.cHigh) {
            return Math.round(((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow);
        }
    }

    // Exceeds max breakpoint
    const highestBp = breakpoints[breakpoints.length - 1];
    if (concentration > highestBp.cHigh) {
        return highestBp.iHigh + Math.round(((concentration - highestBp.cHigh) / highestBp.cHigh) * 100);
    }

    return 0;
}

export function calculateInternationalAQI(pollutants: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
}): { aqi: number; dominantPollutant: string } {
    const indices = [
        { name: 'PM2.5', value: calculateSubIndex(pollutants.pm2_5, PM25_BREAKPOINTS) },
        { name: 'PM10', value: calculateSubIndex(pollutants.pm10, PM10_BREAKPOINTS) },
        { name: 'O₃', value: calculateSubIndex(pollutants.o3, O3_BREAKPOINTS) },
        { name: 'NO₂', value: calculateSubIndex(pollutants.no2, NO2_BREAKPOINTS) },
        { name: 'SO₂', value: calculateSubIndex(pollutants.so2, SO2_BREAKPOINTS) },
        { name: 'CO', value: calculateSubIndex(pollutants.co, CO_BREAKPOINTS) }
    ];

    const maxIndex = indices.reduce((max, current) => current.value > max.value ? current : max, { name: 'Unknown', value: 0 });

    return {
        aqi: maxIndex.value,
        dominantPollutant: maxIndex.name
    };
}
