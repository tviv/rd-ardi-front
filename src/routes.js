import React from 'react';
import Loadable from 'react-loadable';

import DefaultLayout from './containers/DefaultLayout';

function Loading() {
    return <div>Загрузка...</div>;
}

const Dashboard = Loadable({
    loader: () => import('./views/Dashboard'),
    loading: Loading,
});

const OlapSalesCone = Loadable({
    loader: () => import('./views/Olap/SalesCone'),
    loading: Loading,
});

const OlapDailyRevenue = Loadable({
    loader: () => import('./views/Olap/DailyRevenue'),
    loading: Loading,
});

const OlapSegmentRevenue = Loadable({
    loader: () => import('./views/Olap/SegmentRevenue'),
    loading: Loading,
});

const OlapSegmentYearToYear = Loadable({
    loader: () => import('./views/Olap/SegmentYearToYear'),
    loading: Loading,
});

const OlapChecklist = Loadable({
    loader: () => import('./views/Olap/Checklist'),
    loading: Loading,
});

const OlapSettings = Loadable({
    loader: () => import('./views/Olap/Settings'),
    loading: Loading,
});

const OlapSalesConeChart = Loadable({
    loader: () => import('./views/Olap/SalesCone/CompaireShopConesChart'),
    loading: Loading,
});

const OlapActualtiyToolPage = Loadable({
    loader: () => import('./views/Olap/Actuality/PlainToolActuality'),
    loading: Loading,
});

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
    { path: '/', exact: true, name: 'Начало', component: DefaultLayout },
    {
        path: '/dashboard',
        name: 'Общая панель',
        component: Dashboard,
    },
    {
        path: '/olap/sales-cone/compaire-conechart',
        name: 'Диаграмма сравнения КУП',
        component: OlapSalesConeChart,
    },
    {
        path: '/olap/sales-cone',
        name: 'Воронка продаж',
        component: OlapSalesCone,
    },
    {
        path: '/olap/daily-revenue',
        name: 'Ежедневная выручка',
        component: OlapDailyRevenue,
    },
    {
        path: '/olap/segment-revenue',
        name: 'Выручка по сегментам',
        component: OlapSegmentRevenue,
    },
    {
        path: '/olap/segment-year-to-year',
        name: 'Выручка по сегментам год к году',
        component: OlapSegmentYearToYear,
    },
    {
        path: '/olap/checklist',
        name: 'Чек-листы',
        component: OlapChecklist,
    },
    { path: '/olap/settings', name: 'Настройки', component: OlapSettings },
    { path: '/sitehealth', name: 'Настройки', component: OlapActualtiyToolPage },
];

export default routes;
