<!-- components/SearchResults.svelte -->
<script>
    import { searchResults, currentPage, itemsPerPage } from '../stores.js';
    import ResultCard from './ResultCard.svelte';
    
    export let isOffline = false;
  
    $: paginatedResults = $searchResults.slice(
      ($currentPage - 1) * $itemsPerPage, 
      $currentPage * $itemsPerPage
    );
  </script>
  
  <div id="results" class="list-group">
    {#if isOffline}
      <div class="result-wrapper">
        <div class="result-container information-container">
          <h2>Offline</h2>
          <p>It looks like you're offline. Please check your internet connection and try again.</p>
        </div>
      </div>
    {:else if paginatedResults.length === 0}
      <div class="result-wrapper">
        <div class="result-container information-container">
          <h2>No results</h2>
          <p>Try searching for something less specific.</p>
        </div>
      </div>
    {:else}
      {#each paginatedResults as result}
        <ResultCard {result}/>
      {/each}
    {/if}
  </div>