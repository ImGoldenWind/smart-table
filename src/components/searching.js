import {rules, createComparison} from "../lib/compare.js";

export function initSearching(elements, searchField) {
    // @todo: #5.1 — настроить компаратор
    return (data, state, action) => {
        // Очистка поля поиска через кнопку clear
        if (action && action.name === 'clear') {
            const input = action.closest('label')?.querySelector(`[name="${searchField}"]`);
            if (input) {
                input.value = '';
                state[searchField] = '';
            }
        }

        // Создаём компаратор только для поиска
        const compare = createComparison([
            rules.skipEmptyTargetValues,
            rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)
        ]);

        // @todo: #5.2 — применить компаратор
        return data.filter(row => compare(row, state));
    }
}