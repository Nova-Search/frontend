<!-- components/ResultCard.svelte -->
<script>
    export let result;
  
    async function handleFeedback(type) {
      const endpoint = type === 'up' 
        ? 'https://api.novasearch.xyz/quality/rateresult/good'
        : 'https://api.novasearch.xyz/quality/rateresult/bad';
  
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: result.url })
        });
        
        if (!response.ok) throw new Error();
      } catch (err) {
        console.error('Error submitting feedback:', err);
      }
    }
  </script>
  
  <div class="result-wrapper">
    <div class="result-container">
      <a href={result.url} target="_blank">
        {#if result.favicon_id}
          {#if result.favicon_type === 'svg'}
            <object 
              class="favicon"
              type="image/svg+xml"
              data={`https://api.novasearch.xyz/favicon/${result.favicon_id}`}
            />
          {:else}
            <img
              class="favicon"
              src={`https://api.novasearch.xyz/favicon/${result.favicon_id}`}
              alt=""
            />
          {/if}
        {/if}
        {result.title || "<i class='text-muted'>No title available</i>"}
      </a>
      <p class="text-muted small">{result.url}</p>
      <p class="description">
        {result.description || "<i class='text-muted'>Description not available.</i>"}
      </p>
    </div>
    <div class="feedback-buttons">
      <button class="thumbs-up" on:click={() => handleFeedback('up')}>
        <i class="fas fa-thumbs-up"></i>
      </button>
      <button class="thumbs-down" on:click={() => handleFeedback('down')}>
        <i class="fas fa-thumbs-down"></i> 
      </button>
    </div>
  </div>