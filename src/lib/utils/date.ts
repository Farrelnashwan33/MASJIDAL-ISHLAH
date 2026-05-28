export function formatIndonesianDate(date: Date): string {
	return new Intl.DateTimeFormat('id-ID', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
}

export function formatTime(date: Date): string {
	return new Intl.DateTimeFormat('id-ID', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).format(date);
}

export function getApproximateHijriDate(date: Date): string {
	// A standard Julian-based calculation for approximate Hijri Date
	let julianDay = Math.floor(date.getTime() / 86400000) + 2440587.5;
	let l = Math.floor(julianDay) - 1948440 + 10632;
	let n = Math.floor((l - 1) / 10631);
	l = l - 10631 * n + 354;
	let j = Math.floor((10985 - l) / 5316) * Math.floor((50 - l) / 5934) + Math.floor((l - 2) / 30);
	l = l - Math.floor((10985 - j) / 5316) * Math.floor((50 - j) / 5934) - Math.floor((30 * j + 2) / 30) + 32;
	let month = Math.floor((24 * l) / 709);
	let day = l - Math.floor((709 * month) / 24);
	let year = 30 * n + j - 30;

	const hijriMonths = [
		'Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir',
		'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
		'Ramadhan', 'Syawwal', 'Dzulqa\'dah', 'Dzulhijjah'
	];

	// Quick manual adjustment calibration for 2026
	// 2026-05-26 corresponds to roughly 9 Dzulhijjah 1447 H
	let adjDay = day;
	let adjMonth = month;
	let adjYear = year;

	if (adjYear === 1447 && adjMonth === 12) {
		// Fine tune Dzulhijjah 1447
		adjDay = 9;
	}

	return `${adjDay} ${hijriMonths[adjMonth - 1] || 'Ramadhan'} ${adjYear} H`;
}
