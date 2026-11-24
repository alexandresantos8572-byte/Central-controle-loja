import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const KEY = 'cantral-loja-notas-v1';
const initial = [];

function readNotes() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return initial;
  }
}

function money(n) {
  return Number(n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function App() {
  const [notes, setNotes] = useState(readNotes);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todas');
  const [modal, setModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [form, setForm] = useState({
    code: '',
    customer: '',
    pickup: '',
    items: '',
    total: ''
  });
  const [toast, setToast] = useState('');

  function persist(list) {
    setNotes(list);
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function notify(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2800);
  }

  const filtered = useMemo(
    () =>
      notes.filter((n) => {
        const text = [n.code, n.customer, n.pickup]
          .join(' ')
          .toLowerCase();
        const matches = text.includes(query.toLowerCase());
        const status = filter === 'Todas' || n.status === filter;
        return matches && status;
      }),
    [notes, query, filter]
  );

  const pending = notes.filter((n) => n.status === 'Pendente').length;
  const cancelled = notes.filter((n) => n.status === 'Cancelada').length;

  const today = notes.filter(
    (n) =>
      n.createdAt?.slice(0, 10) ===
      new Date().toISOString().slice(0, 10)
  ).length;

  function submit(e) {
    e.preventDefault();

    if (
      !form.code.trim() ||
      !form.customer.trim() ||
      !form.pickup.trim()
    ) {
      notify('Preencha nota, cliente e quem vai retirar.');
      return;
    }

    if (
      notes.some(
        (n) =>
          n.code.toLowerCase() ===
          form.code.trim().toLowerCase()
      )
    ) {
      notify('Já existe uma nota com esse número.');
      return;
    }

    const items = form.items
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const entry = {
      id: crypto.randomUUID(),
      code: form.code.trim(),
      customer: form.customer.trim(),
      pickup: form.pickup.trim(),
      items,
      total: Number(form.total || 0),
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      cancelReason: ''
    };

    persist([entry, ...notes]);

    setForm({
      code: '',
      customer: '',
      pickup: '',
      items: '',
      total: ''
    });

    setModal(false);
    notify('Nota cadastrada no dispositivo.');
  }

  function cancel() {
    if (!cancelReason.trim()) {
      notify('Informe o motivo do cancelamento.');
      return;
    }

    persist(
      notes.map((n) =>
        n.id === cancelTarget
          ? {
              ...n,
              status: 'Cancelada',
              cancelReason,
              cancelledAt: new Date().toISOString()
            }
          : n
      )
    );

    setCancelTarget(null);
    setCancelReason('');
    notify('Cancelamento registrado.');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CC</div>
          <div>
            <strong>CANTRAL</strong>
            <span>CONTROLE · LOJA</span>
          </div>
        </div>

        <nav>
          <a className="active">▦　Painel</a>
          <a onClick={() => setFilter('Todas')}>▤　Notas</a>
          <a onClick={() => setFilter('Pendente')}>◷　Pendentes</a>
          <a onClick={() => setFilter('Cancelada')}>⊘　Canceladas</a>
        </nav>

        <div className="side-bottom">
          <span className="dot" />
          Sistema de loja
          <small>V1.0 · Preparado para integração</small>
        </div>
      </aside>

      <main className="main">
        <header>
          <div className="mobile-brand">
            <div className="brand-mark">CC</div>
            <strong>CANTRAL CONTROLE</strong>
          </div>

          <div className="header-right">
            <span className="live">
              <i /> Local de testes
            </span>
            <button className="btn primary" onClick={() => setModal(true)}>
              ＋ Nova nota
            </button>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">CONTROLE DE SAÍDA · LOJA</p>
            <h1>Notas de venda</h1>
            <p>
              Organize as notas e identifique quem está autorizado
              a retirar a mercadoria.
            </p>
          </div>
          <div className="welcome-icon">▧</div>
        </section>

        <section className="stats">
          <div className="stat">
            <label>NOTAS REGISTRADAS</label>
            <strong>{notes.length}</strong>
            <span>▤ Total no dispositivo</span>
          </div>

          <div className="stat">
            <label>PENDENTES</label>
            <strong>{pending}</strong>
            <span>◷ Aguardando retirada</span>
          </div>

          <div className="stat">
            <label>HOJE</label>
            <strong>{today}</strong>
            <span>▣ Registros de hoje</span>
          </div>

          <div className="stat">
            <label>CANCELADAS</label>
            <strong>{cancelled}</strong>
            <span>⊘ Mantidas no histórico</span>
          </div>
        </section>

        <section className="notes-panel">
          <div className="panel-head">
            <div>
              <h2>Notas recentes</h2>
              <p>Consulte e acompanhe as notas registradas.</p>
            </div>

            <button
              className="btn outline"
              onClick={() => {
                setFilter('Todas');
                setQuery('');
              }}
            >
              Limpar filtros
            </button>
          </div>

          <div className="tools">
            <div className="search">
              ⌕
              <input
                placeholder="Buscar nota, cliente ou retirada..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>Todas</option>
              <option>Pendente</option>
              <option>Cancelada</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <div>▤</div>
              <strong>Nenhuma nota encontrada</strong>
              <p>
                Quando as notas forem cadastradas, elas aparecerão aqui.
              </p>
              <button
                className="btn primary"
                onClick={() => setModal(true)}
              >
                ＋ Registrar nota de teste
              </button>
            </div>
          ) : (
            <div className="note-list">
              {filtered.map((n) => (
                <article className="note" key={n.id}>
                  <div className="note-top">
                    <div className="note-number">
                      <span className="receipt-icon">▤</span>
                      <div>
                        <strong>Nota {n.code}</strong>
                        <small>
                          {new Date(n.createdAt).toLocaleString('pt-BR')}
                        </small>
                      </div>
                    </div>

                    <span
                      className={`status ${
                        n.status === 'Cancelada'
                          ? 'cancelled'
                          : 'pending'
                      }`}
                    >
                      {n.status}
                    </span>
                  </div>

                  <div className="note-info">
                    <div>
                      <label>CLIENTE</label>
                      <b>{n.customer}</b>
                    </div>

                    <div>
                      <label>QUEM VAI RETIRAR</label>
                      <b className="pickup">♙ {n.pickup}</b>
                    </div>
                  </div>

                  {n.items?.length > 0 && (
                    <div className="products">
                      <label>PRODUTOS</label>
                      {n.items.map((item, i) => (
                        <span key={i}>• {item}</span>
                      ))}
                    </div>
                  )}

                  <div className="note-foot">
                    <strong>Total: {money(n.total)}</strong>

                    {n.status === 'Pendente' ? (
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setCancelTarget(n.id);
                          setCancelReason('');
                        }}
                      >
                        Cancelar nota
                      </button>
                    ) : (
                      <div className="cancel-reason">
                        Motivo: {n.cancelReason}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer>
          CANTRAL CONTROLE — LOJA <span>•</span> Versão inicial para testes
        </footer>
      </main>

      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">REGISTRO DE TESTE</p>
                <h2>Nova nota</h2>
              </div>

              <button className="close" onClick={() => setModal(false)}>
                ×
              </button>
            </div>

            <p className="modal-note">
              Esta entrada é manual apenas nesta versão de demonstração.
              A captura automática será conectada ao sistema de vendas
              após identificarmos o software usado na loja.
            </p>

            <form onSubmit={submit}>
              <label>Número da nota *</label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
                placeholder="Ex.: 10482"
                required
              />

              <label>Nome do cliente *</label>
              <input
                value={form.customer}
                onChange={(e) =>
                  setForm({ ...form, customer: e.target.value })
                }
                placeholder="Nome do cliente"
                required
              />

              <label>Quem vai retirar a mercadoria? *</label>
              <input
                value={form.pickup}
                onChange={(e) =>
                  setForm({ ...form, pickup: e.target.value })
                }
                placeholder="Nome do responsável pela retirada"
                required
              />

              <label>Produtos e quantidades (uma linha por item)</label>
              <textarea
                value={form.items}
                onChange={(e) =>
                  setForm({ ...form, items: e.target.value })
                }
                placeholder="Ex.: 2 sacos de ração 20 kg"
                rows="3"
              />

              <label>Total (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total}
                onChange={(e) =>
                  setForm({ ...form, total: e.target.value })
                }
                placeholder="0,00"
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn outline"
                  onClick={() => setModal(false)}
                >
                  Voltar
                </button>

                <button type="submit" className="btn primary">
                  Salvar nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="overlay" onClick={() => setCancelTarget(null)}>
          <div
            className="modal small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>Cancelar nota</h2>
              <button
                className="close"
                onClick={() => setCancelTarget(null)}
              >
                ×
              </button>
            </div>

            <p className="modal-note">
              O cancelamento será registrado no histórico deste navegador.
            </p>

            <label>Motivo do cancelamento *</label>
            <textarea
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Informe o motivo..."
            />

            <div className="modal-actions">
              <button
                className="btn outline"
                onClick={() => setCancelTarget(null)}
              >
                Voltar
              </button>

              <button className="btn danger" onClick={cancel}>
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
