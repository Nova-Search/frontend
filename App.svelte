<!-- App.svelte -->
<script>
    import SearchForm from './components/SearchForm.svelte';
    import SearchResults from './components/SearchResults.svelte';
    import Pagination from './components/Pagination.svelte';
    import { onMount } from 'svelte';
    import { searchResults, currentPage, itemsPerPage } from './stores.js';
  
    let resultsInfo = '';
    let isOffline = false;
    let startTime;
  
    onMount(() => {
      isOffline = !navigator.onLine;
      if (!getCookie('hasSeenWelcomeMessage')) {
        displayWelcomeMessage();
        setCookie('hasSeenWelcomeMessage', 'true', 365); 
      }
    });
  </script>
  
  <div class="container mt-4 text-start">
    <SearchIcon/>
    <SearchForm on:search={handleSearch}/>
    {#if resultsInfo}
      <div id="resultsInfo">{resultsInfo}</div>
    {/if}
    <SearchResults {isOffline}/>
    <Pagination/>
  </div>