<script>
    import SocialGrid from '$components/SocialGrid.svelte';
    import BlogLister from '$components/BlogLister.svelte';
    import ProjectsLister from '$components/ProjectsLister.svelte';
    import {title} from '../stores';
    import BlogListerLoading from "$components/BlogListerLoading.svelte";
    import Error from "$components/Error.svelte";

    export let data;

    $title = 'Home';
</script>

<div class="dark:bg-slate-900 dark:text-white">
    <div class="ct">
        <div class="min-h-screen px-8 z-0 relative">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-screen">
                <!-- the size of this thing should be ~56.25% of the size of the "hello" image -->
                <img
                        src="/curvy_things.svg"
                        alt="Curvy things"
                        class="absolute top-[3.125rem] sm:top-0 left-0 h-[10rem] md:h-[13rem] lg:h-[18rem] dark:brightness-90 dark:invert aspect-square"
                />
                <div class="flex flex-col">
                    <div class="md:m-auto md:ml-16 text-center md:text-left">
                        <p class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">
                            👋 Hey there, I'm
                        </p>
                        <h1
                                class="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-t from-[#7BC6CC] to-[#BE93C5] bg-clip-text text-transparent font-black drop-shadow-lg my-4 md:my-8 py-2"
                        >
                            Alex Wang
                        </h1>
                        <p class="font-display text-xl md:text-2xl sm:text-3xl">
                            I'm obsessed with mobility, technology, and solutions.
                        </p>
                    </div>
                </div>
                <div class="flex order-first md:order-last">
                    <img
                            src="/blob.svg"
                            alt="Background blob"
                            class="md:m-auto mt-auto mx-auto dark:brightness-90 aspect-square h-56 sm:h-72 md:h-96 lg:h-[32rem]"
                    />
                </div>
            </div>
        </div>
    </div>
</div>

<div class="bg-gray-200 p-8 md:p-12 dark:bg-slate-700 dark:text-white">
    <div class="flex">
        <div class="text-2xl md:text-3xl m-auto font-display md:leading-relaxed max-w-4xl space-y-8">
            <p>
                I'm a <span class="font-bold">📊 systems engineer</span> by training and an autodidactic
                <span class="font-bold">💻 web developer</span>
                +
                <span class="font-bold">🐍 DevOps pro</span>.
            </p>
            <p>
                I'm based in <span class="font-bold">🚗 Detroit, MI</span> and
                <span class="font-bold">🌴 Los Angeles, CA</span>. I'm currently a student at the
                <span class="font-bold">🐴 University of Southern California</span>.
            </p>
            <p>
                I like <span class="font-bold">😋 food</span>,
                <span class="font-bold">🚆 transportation</span>,
                <span class="font-bold">🌐 GeoGuessr</span>, <span class="font-bold">💻 tech</span>, and
                <span class="font-bold">📚 learning</span>.
            </p>
        </div>
    </div>
</div>

<!-- <div class="py-12 px-8 bg-[#7E1F86] flex">
	<p class="text-3xl italic text-white m-auto font-light">
		If passion drives you, let reason hold the reins.
	</p>
</div> -->

<div class="p-8 dark:bg-slate-900 dark:text-white">
    <div class="ct">
        <h1 class="font-display text-3xl md:text-4xl font-bold text-center mb-8">Writing</h1>
        <!--        is this a crappy way to handle the stream? -->
        {#await data.streamed.blogPostsRequest}
            <BlogListerLoading/>
        {:then blogPostsReq}
            {#await blogPostsReq.json()}
                <BlogListerLoading/>
            {:then posts}
                <BlogLister posts="{posts}"/>
            {/await}
        {:catch error}
            <Error message="{error}"/>
        {/await}

        <p class="text-center mt-6 text-lg">
            <a href="https://blog.unixfy.net" target="_blank" rel="noopener"
            >View more <i class="fa-solid fa-arrow-right"></i></a
            >
        </p>
    </div>
</div>

<div class="p-8 bg-[#7E1F86] text-white">
    <div class="ct">
        <div class="flex flex-col md:flex-row">
            <div class="flex">
                <h1
                        class="font-display text-3xl md:text-4xl font-bold md:[writing-mode:vertical-lr] md:rotate-180 m-auto mb-8 md:mb-auto md:mr-8"
                >
                    Stuff I've Done
                </h1>
            </div>
            <ProjectsLister limit="6"/>
            <a
                    href="/projects"
                    class="p-4 md:p-6 bg-white text-black flex rounded-lg mt-8 md:mt-0 md:ml-8 hover:bg-gray-100 dark:text-white dark:bg-slate-900 dark:hover:bg-slate-800 transition-all"
                    aria-label="View more projects"
            >
                <div class="m-auto text-center">
                    <p class="md:hidden text-xl">View all <i class="fa-solid fa-arrow-right"/></p>
                    <!-- This bit only shows md or larger -->
                    <i class="hidden md:block fa-solid fa-arrow-right fa-3x m-auto"/>
                </div>
            </a>
        </div>
    </div>
</div>

<div class="dark:bg-slate-900 dark:text-white bg-gray-100">
    <div class="ct">
        <div class="grid grid-cols-1 lg:grid-cols-2">
            <SocialGrid/>
            <div class="p-8 flex">
                <div class="m-auto">
                    <h1 class="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
                        Let's get in touch!
                    </h1>
                    <div
                            class="bg-slate-400 dark:bg-slate-500 p-4 drop-shadow-lg hover:drop-shadow-2xl dark:drop-shadow-white transition max-w-6xl text-white md:mx-8 aspect-[3.5 / 2]"
                    >
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                            <div class="flex flex-col">
                                <p class="text-3xl font-display font-bold text-center mb-8">Alex Wang</p>
                                <img
                                        class="mx-auto h-48 w-48"
                                        alt="Jumping out of an envelope"
                                        src="/envelope.png"
                                />
                            </div>
                            <div class="flex flex-col justify-between">
                                <p class="lowercase text-center sm:text-right font-extralight text-xl">
                                    Building reliable, efficient, usable, & informed solutions.
                                </p>
                                <div class="mt-8 sm:mb-8 grid grid-rows-4 gap-4 font-semibold text-right text-2xl">
                                    <div class="flex flex-row justify-between">
                                        <i class="fa-solid fa-envelope"/>
                                        <p>alex [at] alexwang.net</p>
                                    </div>
                                    <div class="flex flex-row justify-between">
                                        <i class="fa-brands fa-linkedin"/>
                                        <p>/in/alex-y-wang</p>
                                    </div>
                                    <div class="flex flex-row justify-between">
                                        <i class="fa-solid fa-link"/>
                                        <p>alexwang.net</p>
                                    </div>
                                    <div class="flex flex-row justify-between">
                                        <i class="fa-solid fa-phone"/>
                                        <p>+1 123-123-1234</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
