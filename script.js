const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalValue = document.getElementById('totalValue');
const expenseCount = document.getElementById('expenseCount');
const maxExpense = document.getElementById('maxExpense');
const categoryChart = document.getElementById('categoryChart');
const donutChart = document.getElementById('donutChart');
const donutLegend = document.getElementById('donutLegend');

const STORAGE_KEY = 'monthlyExpenses';
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const categoryColors = {
  Moradia: '#4f46e5',
  Alimentação: '#10b981',
  Transporte: '#f59e0b',
  Lazer: '#ec4899',
  Saúde: '#14b8a6',
  Outros: '#6b7280',
};

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getCategoryTotals() {
  const totals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});
  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function renderCategoryChart() {
  const totals = getCategoryTotals();
  categoryChart.innerHTML = '';

  if (totals.length === 0) {
    categoryChart.textContent = 'Adicione despesas para ver os gráficos.';
    return;
  }

  const maxTotal = totals[0].total;
  totals.forEach(({ category, total }) => {
    const percent = (total / maxTotal) * 100;
    const row = document.createElement('div');
    row.className = 'bar-row';

    const label = document.createElement('span');
    label.className = 'bar-label';
    label.textContent = category;

    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${percent}%`;
    fill.style.background = categoryColors[category] || '#4f46e5';

    track.appendChild(fill);

    const value = document.createElement('span');
    value.className = 'bar-value';
    value.textContent = formatCurrency(total);

    row.append(label, track, value);
    categoryChart.appendChild(row);
  });
}

function renderDonutChart() {
  const totals = getCategoryTotals();
  const sum = totals.reduce((acc, item) => acc + item.total, 0);
  donutLegend.innerHTML = '';

  if (sum === 0) {
    donutChart.style.background = '#e5e7eb';
    donutLegend.textContent = 'Adicione despesas para ver a distribuição.';
    return;
  }

  let current = 0;
  const segments = totals.map((item, index) => {
    const percent = Math.round((item.total / sum) * 10000) / 100;
    const color = categoryColors[item.category] || '#9ca3af';
    const end = index === totals.length - 1 ? 100 : current + percent;
    const segment = `${color} ${current}% ${end}%`;
    current = end;
    return segment;
  });

  donutChart.style.background = `conic-gradient(${segments.join(', ')})`;

  totals.forEach(({ category, total }) => {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const colorMark = document.createElement('span');
    colorMark.className = 'legend-color';
    colorMark.style.background = categoryColors[category] || '#9ca3af';

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.textContent = `${category}: ${formatCurrency(total)}`;

    item.append(colorMark, label);
    donutLegend.appendChild(item);
  });
}

function renderCharts() {
  renderCategoryChart();
  renderDonutChart();
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function calculateTotals() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const max = expenses.length > 0 ? Math.max(...expenses.map(item => item.amount)) : 0;
  totalValue.textContent = formatCurrency(total);
  expenseCount.textContent = expenses.length;
  maxExpense.textContent = formatCurrency(max);
}

function removeExpense(id) {
  expenses = expenses.filter(item => item.id !== id);
  saveExpenses();
  renderExpenses();
}

function renderExpenses() {
  expenseList.innerHTML = '';

  if (expenses.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'Nenhuma despesa registrada ainda.';
    cell.style.color = '#6b7280';
    row.appendChild(cell);
    expenseList.appendChild(row);
    calculateTotals();
    renderCharts();
    return;
  }

  expenses.forEach(({ id, description, category, amount }) => {
    const row = document.createElement('tr');

    const descCell = document.createElement('td');
    descCell.textContent = description;

    const categoryCell = document.createElement('td');
    categoryCell.textContent = category;

    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(amount);

    const actionCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.className = 'action-btn';
    removeButton.textContent = 'Remover';
    removeButton.addEventListener('click', () => removeExpense(id));
    actionCell.appendChild(removeButton);

    row.append(descCell, categoryCell, amountCell, actionCell);
    expenseList.appendChild(row);
  });

  calculateTotals();
  renderCharts();
}

expenseForm.addEventListener('submit', event => {
  event.preventDefault();

  const descriptionInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const categoryInput = document.getElementById('category');

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;

  if (!description || amount <= 0) {
    alert('Preencha a descrição e informe um valor maior que zero.');
    return;
  }

  const expense = {
    id: Date.now().toString(),
    description,
    amount,
    category,
  };

  expenses.push(expense);
  saveExpenses();
  renderExpenses();

  expenseForm.reset();
  descriptionInput.focus();
});

renderExpenses();
