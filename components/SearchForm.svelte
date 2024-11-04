<!-- components/SearchForm.svelte -->
<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
    let query = '';
  
    async function handleSubmit(e) {
      e.preventDefault();
      dispatch('search', { query });
    }
  </script>
  
  <form id="searchForm" class="d-flex my-4 align-items-start" on:submit={handleSubmit}>
    <input 
      class="form-control me-2" 
      type="search"
      bind:value={query}
      placeholder="Search Nova..." 
      required
    />
    <button class="btn btn-primary search-button" type="submit">
      Search
    </button>
  </form>