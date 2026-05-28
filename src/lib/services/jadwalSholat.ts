export interface PrayerTimings {
	Fajr: string;
	Sunrise: string;
	Dhuhr: string;
	Asr: string;
	Maghrib: string;
	Isha: string;
}

const fallbackTimings: PrayerTimings = {
	Fajr: '04:35',
	Sunrise: '05:52',
	Dhuhr: '11:51',
	Asr: '15:12',
	Maghrib: '17:47',
	Isha: '18:59'
};

export async function getJadwalSholat(): Promise<PrayerTimings> {
	try {
		// Method 2 is ISNA, method 11 is Kemenag (Majelis Ulama Indonesia/Kementerian Agama RI)
		const res = await fetch('https://api.aladhan.com/v1/timings?latitude=-7.0311&longitude=107.5186&method=11');
		if (!res.ok) throw new Error('Failed to fetch prayer times');
		const json = await res.json();
		if (json.data && json.data.timings) {
			const { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha } = json.data.timings;
			return { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha };
		}
		return fallbackTimings;
	} catch (e) {
		console.warn('Prayer times API failed, using fallback:', e);
		return fallbackTimings;
	}
}
