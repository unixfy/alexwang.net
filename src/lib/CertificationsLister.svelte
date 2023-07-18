<script>
	import dayjs from 'dayjs/esm';
	import utc from 'dayjs/esm/plugin/utc';
	import certifications from '$lib/certifications.json';
</script>

<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8 lg:gap-16">
	{#each certifications as certification}
		<div
			class="flex flex-col justify-between grayscale hover:grayscale-0 hover:scale-110 transition-all"
		>
			<img
				src="/certifications/{certification.image}"
				alt="Shield for {certification.name}"
				class="w-36 aspect-square justify-self-start self-center mb-4"
			/>
			<p class="font-bold font-display mb-2 text-center">{certification.name}</p>
			<p class="text-xs justify-self-end text-center">
				{certification.reference} - {dayjs(certification.date).utc().format('MMMM YYYY')}
			</p>
		</div>
	{/each}
</div>
