<script>
    export let message;
</script>

<div class="bg-red-500 text-white dark:bg-red-800 rounded-lg p-4">
    <p class="text-xl font-display font-bold">Oops, an error occurred!</p>
    <div class="font-mono my-4 mx-2">
        {message}
    </div>
    <p class="text-lg">You can try reloading the page.</p>
</div>
