import './fonts/ys-display/fonts.css';
import './style.css';

import {data as sourceData} from "./data/dataset_1.js";
import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";
import {getPages, createPage} from "./lib/utils.js";

// Исходные данные для render()
const {data, ...indexes} = initData(sourceData);

// Инициализация таблицы с search, header, filter и pagination
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],  // search → фильтр → сортировка
    after: ['pagination']
}, render);

// Инициализация поиска
const applySearching = initSearching(sampleTable.search.elements, 'search');

// Инициализация фильтрации
const applyFiltering = initFiltering(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
    searchByCustomer: indexes.customers
});

// Инициализация сортировки
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// Инициализация пагинации
const applyPagination = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);      
    const page = parseInt(state.page ?? 1);               
    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState();       // состояние полей
    let result = [...data];           // копия исходных данных

    // 1. Поиск
    result = applySearching(result, state, action);

    // 2. Фильтрация
    result = applyFiltering(result, state, action);

    // 3. Сортировка
    result = applySorting(result, state, action);

    // 4. Пагинация
    result = applyPagination(result, state, action);

    // 5. Вывод в таблицу
    sampleTable.render(result);
}

// Подключение таблицы к DOM
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Первоначальный рендер
render();