<script>
    import Error from "$lib/Error.svelte";
    import NowLoading from "$lib/NowLoading.svelte";
    import dayjs from "dayjs/esm";
    import utc from 'dayjs/esm/plugin/utc';
    dayjs.extend(utc);

    export let data;
</script>

<div class="bg-gray-100 dark:bg-gray-800 dark:text-white text-center min-h-[33vh] flex">
    <div class="m-auto p-16">
        <h1 class="text-4xl font-display font-bold my-4">Now</h1>
        <h2 class="text-2xl">This is a now page. Inspired by <a class="link" href="https://nownownow.com/about" target="_blank"
                                            rel="noreferrer">Derek Sivers</a></h2>
    </div>
</div>

<div class="dark:bg-gray-900 dark:text-white">
    <div class="p-8 lg:p-16 max-w-screen-sm m-auto">
        <div class="flex flex-col space-y-4 text-lg now-data-container">
            {#await data.streamed.pageRequest}
                <NowLoading/>
            {:then pageReq}
                {#await pageReq.json()}
                    <NowLoading/>
                {:then pageData}
                    <p class="text-sm italic">Last
                        updated {dayjs(pageData[0].modified_gmt).utc().format('MMMM DD, YYYY')}</p>
                    <hr/>
                    {@html pageData[0].content.rendered}
                {/await}
            {:catch error}
                <Error message="{error}"/>
            {/await}
        </div>
    </div>
</div>

