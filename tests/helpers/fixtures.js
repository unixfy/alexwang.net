// A small, realistic CMS: enough of every collection for each page to render all of its parts.

const paragraph = (/** @type {string} */ text) => ({ type: 'paragraph', data: { text } });
const header = (/** @type {string} */ text, level = 2) => ({
	type: 'header',
	data: { text, level }
});

/** An Editor.js body of roughly `words` words, with headings, lists, a table, code and an image. */
export function body(words = 600) {
	const sentence =
		'The train left the station on time & the passengers watched the city slide by. ';
	const per = sentence.split(' ').length - 1;
	const paras = Math.max(1, Math.round(words / per / 3));
	return {
		time: 0,
		blocks: [
			paragraph(
				`Opening words with <b>bold</b>, <a href="https://example.com">a link</a> and <code>code</code>.`
			),
			header('Getting started'),
			...Array.from({ length: paras }, () => paragraph(sentence.repeat(3))),
			{
				type: 'list',
				data: {
					style: 'unordered',
					items: [
						{ content: 'One', items: [] },
						{ content: 'Two', items: [{ content: 'Two-a', items: [] }] }
					]
				}
			},
			header('Details'),
			{
				type: 'table',
				data: {
					withHeadings: true,
					content: [
						['Item', 'Cost'],
						['Fare', '$2'],
						['Total', '$2']
					]
				}
			},
			{ type: 'code', data: { code: 'const x = 1 < 2;' } },
			{
				type: 'image',
				data: {
					file: { url: 'https://cms.alexwang.net/assets/abc-123', width: 2000, height: 1000 },
					caption: 'A <i>train</i>'
				}
			},
			header('Wrapping up'),
			...Array.from({ length: paras }, () => paragraph(sentence.repeat(3))),
			{ type: 'quote', data: { text: 'All aboard', caption: 'Conductor' } },
			{ type: 'delimiter', data: {} }
		]
	};
}

const categories = [
	{ name: 'Technology', slug: 'technology', description: 'Servers and code.' },
	{ name: 'Travel', slug: 'travel', description: '' }
];
const tags = [
	{ name: 'Rail', slug: 'rail', description: 'Trains.' },
	{ name: 'Linux', slug: 'linux', description: null }
];

/** @param {number} i */
function post(i) {
	const day = String(28 - (i % 28)).padStart(2, '0');
	const month = String(12 - Math.floor(i / 28)).padStart(2, '0');
	return {
		id: i + 1,
		title: `Post number ${i + 1} & friends`,
		slug: `post-${i + 1}`,
		status: 'published',
		excerpt: i % 3 === 0 ? `<p>Summary of post ${i + 1}</p>` : null,
		seo_description: i % 3 === 1 ? `SEO text for post ${i + 1}` : null,
		content: body(400 + i * 50),
		date_published: `2025-${month}-${day}T10:00:00`,
		featured_image: i % 2 === 0 ? `img-${i + 1}` : null,
		comments_enabled: i === 0,
		redirect_url: i === 5 ? 'https://elsewhere.example/post' : null,
		seo_noindex: i === 6,
		seo_nofollow: false,
		seo_noarchive: false,
		categories: [
			{ is_primary: false, categories_id: categories[(i + 1) % 2] },
			{ is_primary: true, categories_id: categories[i % 2] }
		],
		tags: [{ tags_id: tags[i % 2] }]
	};
}

export function fixtures() {
	const posts = Array.from({ length: 24 }, (_, i) => post(i));
	return {
		singletons: {
			config: {
				banner_enabled: true,
				banner_content: 'Now <a href="/blog">writing</a> again',
				sshkey: 'ssh-ed25519 AAAATEST alex@example',
				links_profile_picture: 'avatar-1',
				homepage_welcome_text: 'Hello there',
				lead_text: 'I build things.'
			}
		},
		collections: {
			posts,
			categories,
			tags,
			comments: [
				{
					id: 1,
					parent: null,
					author_name: 'Ada',
					content: 'Great post',
					date_created: '2025-12-29T00:00:00',
					post: 1
				},
				{
					id: 2,
					parent: 1,
					author_name: 'Grace',
					content: 'Agreed',
					date_created: '2025-12-30T00:00:00',
					post: 1
				},
				{
					id: 3,
					parent: 99,
					author_name: 'Linus',
					content: 'Orphan',
					date_created: '2025-12-31T00:00:00',
					post: 1
				}
			],
			pages: [
				{
					title: 'Now',
					subtitle: '<p>What I am doing</p>',
					slug: 'now',
					date_updated: '2025-11-01T00:00:00',
					status: 'published',
					content_html:
						'<h2>Work</h2><p>Busy.</p><ul>' +
						'<li>item</li>'.repeat(14) +
						'</ul><h2>Play</h2><p>Trains.</p>'
				},
				{
					title: 'What I Like',
					subtitle: null,
					slug: 'i-like',
					date_updated: '2025-10-01T00:00:00',
					status: 'published',
					content_html: '<p>No headings here.</p>'
				}
			],
			projects: [
				{
					title: 'Transit map',
					slug: 'transit-map',
					image: 'p1',
					start_date: '2024-01-01',
					end_date: null,
					url: 'https://www.example.com/map',
					content_html: '<p>A map of <b>everything</b>.</p>',
					status: 'published'
				},
				{
					title: 'Home lab',
					slug: 'home-lab',
					image: null,
					start_date: '2022-03-01',
					end_date: '2023-06-01',
					url: null,
					content_html: '<p>Servers in a closet.</p>',
					status: 'published'
				},
				{
					title: 'Old site',
					slug: 'old-site',
					image: 'p3',
					start_date: null,
					end_date: '2020-01-01',
					url: 'not a url',
					content_html: null,
					status: 'published'
				}
			],
			certifications: [
				{
					name: 'Cert',
					reference: 'ABC',
					date: '2024-05-01',
					image: 'c1',
					url: 'https://cert.example'
				}
			],
			socials: [
				{ name: 'GitHub', color: '#000', url: 'https://github.com/example', icon: 'fa-github' }
			],
			recognitions: [
				{ name: 'Award', image: 'r1', description: '<p>For trains</p>', date: '2023-01-01' }
			],
			employments: [
				{
					start_date: '2023-01-01',
					end_date: null,
					title: 'Engineer',
					employer_name: 'Rail Co',
					employer_url: 'https://rail.example',
					location: 'Remote',
					description: '<p>Built trains.</p>'
				},
				{
					start_date: '2020-01-01',
					end_date: '2022-12-01',
					title: 'Intern',
					employer_name: 'Bus Co',
					employer_url: null,
					location: null,
					description: null
				}
			],
			educations: [
				{
					start_date: '2016-09-01',
					end_date: '2020-06-01',
					institution_name: 'University',
					degree_name: 'BSc',
					description: '<p>Studied.</p>'
				}
			],
			links: [
				{ title: 'Website', url: 'https://alexwang.net', icon: 'fa-globe' },
				{ title: 'Blog', url: 'https://alexwang.net/blog', icon: null }
			]
		}
	};
}
