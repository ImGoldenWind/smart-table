export function initSearching(elements, searchField) {

    return (query, state, action) => {

        if (action && action.name === 'clear') {

            const input = action.closest('label')
                ?.querySelector(`[name="${searchField}"]`);

            if (input) {
                input.value = '';
                state[searchField] = '';
            }
        }

        return state[searchField]
            ? Object.assign({}, query, {
                search: state[searchField]
            })
            : query;
    }
}

