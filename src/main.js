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

// инициализация API
const api = initData(sourceData);

// инициализация таблицы
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// поиск
const applySearching = initSearching(
    sampleTable.search.elements,
    'search'
);

// фильтрация
const {applyFiltering, updateIndexes} = initFiltering(
    sampleTable.filter.elements
);

// сортировка
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// пагинация
const {applyPagination, updatePagination} = initPagination(
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
 * Сбор состояния формы
 */
function collectState() {

    const state = processFormData(
        new FormData(sampleTable.container)
    );

    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка таблицы
 */
async function render(action) {

    let state = collectState();
    let query = {};

    // поиск
    query = applySearching(query, state, action);

    // фильтрация
    query = applyFiltering(query, state, action);

    // сортировка
    query = applySorting(query, state, action);

    // пагинация
    query = applyPagination(query, state, action);

    // запрос к серверу
    const { total, items } = await api.getRecords(query);

    // обновление пагинатора
    updatePagination(total, query);

    // рендер строк таблицы
    sampleTable.render(items);
}

// подключаем таблицу к DOM
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

/**
 * инициализация приложения
 */
async function init() {

    const indexes = await api.getIndexes();

    // заполнение select продавцов
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

// запуск
init().then(render);
