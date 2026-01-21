import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8080";

type PropertyStatus = "AVAILABLE" | "BLOCKED" | "INACTIVE" | string;

type Property = {
  id: number;
  title: string;
  type: string;
  location: string;
  nightlyPrice: number;
  maxGuests: number;
  status: PropertyStatus;
  description?: string | null;
};

type Reservation = {
  id: number;
  propertyId: number;
  propertyTitle?: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  status: string; // BOOKED / CANCELLED / COMPLETED
  totalPrice: number;
  createdAt: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type Filter = "ALL" | "AVAILABLE" | "BLOCKED";

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // formulário
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [nightlyPrice, setNightlyPrice] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [description, setDescription] = useState("");

  // filtros
  const [filter, setFilter] = useState<Filter>("ALL");

  // reservas
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  async function loadProperties() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/properties`);

      if (!res.ok) {
        throw new Error("Erro ao carregar imóveis");
      }

      const data: Page<Property> = await res.json();
      setProperties(data.content ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro inesperado ao carregar imóveis");
    } finally {
      setLoading(false);
    }
  }

  async function loadReservations() {
    try {
      setLoadingReservations(true);

      const res = await fetch(`${API_BASE_URL}/reservations`);

      if (!res.ok) {
        throw new Error("Erro ao carregar reservas");
      }

      const data: Reservation[] = await res.json();
      setReservations(data);
    } catch (err) {
      console.error(err);
      // se quiser depois criamos um estado de erro específico para reservas
    } finally {
      setLoadingReservations(false);
    }
  }

  const visibleProperties = properties.filter((p) => {
    if (filter === "ALL") return true;
    if (filter === "AVAILABLE") return p.status === "AVAILABLE";
    if (filter === "BLOCKED") return p.status === "BLOCKED";
    return true;
  });

  async function handleCreateProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !type.trim() || !location.trim()) {
      setError("Preencha pelo menos título, tipo e localização.");
      return;
    }

    try {
      setError(null);

      const res = await fetch(`${API_BASE_URL}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type: type.trim(),
          location: location.trim(),
          nightlyPrice: nightlyPrice ? Number(nightlyPrice) : null,
          maxGuests: maxGuests ? Number(maxGuests) : null,
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar imóvel");
      }

      // limpa form
      setTitle("");
      setType("");
      setLocation("");
      setNightlyPrice("");
      setMaxGuests("");
      setDescription("");

      await loadProperties();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro inesperado ao salvar imóvel");
    }
  }

    async function handleDeleteProperty(id: number) {
    const sure = window.confirm(
      "Tem certeza que deseja remover esse imóvel do painel?"
    );
    if (!sure) return;

    try {
      setError(null);

      const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("Erro ao remover imóvel");
      }

      // remove da lista sem precisar recarregar tudo
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro inesperado ao remover imóvel");
    }
  }


  useEffect(() => {
    loadProperties();
    loadReservations();
  }, []);

  return (
    <div className="app-root">
      <aside className="app-sidebar">
        <div className="logo-block">
          <span className="logo-main">RENTAL</span>
          <span className="logo-highlight">PROPERTIES</span>
        </div>

        <p className="sidebar-subtitle">Painel de imóveis por temporada</p>

        <p className="sidebar-text">
          Organize seus anúncios, controle reservas e visualize tudo em um
          painel único, pensado para impressionar recrutadores 👀
        </p>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Imóveis cadastrados</h1>
            <p>
              {properties.length === 0
                ? "Nenhum imóvel cadastrado nesta página."
                : `Encontramos ${visibleProperties.length} imóvel(is) nesta página.`}
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              const formEl =
                document.querySelector<HTMLDivElement>("#form-section");
              formEl?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            + Novo imóvel
          </button>
        </header>

        {error && <div className="alert error">{error}</div>}
        {loading && <div className="alert">Carregando imóveis...</div>}

        <section className="app-grid">
          {/* Coluna esquerda: filtros + reservas */}
          <section className="card filters-card">
            <h2>Filtros</h2>
            <p>Depois a gente liga esses filtros de verdade 😉</p>

            <div className="fake-filters">
              <button
                type="button"
                className={`pill ${filter === "ALL" ? "pill-active" : ""}`}
                onClick={() => setFilter("ALL")}
              >
                Todos
              </button>

              <button
                type="button"
                className={`pill ${
                  filter === "AVAILABLE" ? "pill-active" : ""
                }`}
                onClick={() => setFilter("AVAILABLE")}
              >
                Disponíveis
              </button>

              <button
                type="button"
                className={`pill ${
                  filter === "BLOCKED" ? "pill-active" : ""
                }`}
                onClick={() => setFilter("BLOCKED")}
              >
                Bloqueados
              </button>
            </div>

            {/* bloco de reservas abaixo dos filtros */}
            <section className="card" style={{ marginTop: "1rem" }}>
              <h2>Próximas reservas</h2>
              <p className="form-subtitle">
                Visão rápida das reservas já cadastradas no sistema.
              </p>

              {loadingReservations ? (
                <p>Carregando reservas...</p>
              ) : reservations.length === 0 ? (
                <p className="empty-state">
                  Nenhuma reserva cadastrada ainda. Depois vamos permitir criar
                  reservas direto daqui. 😉
                </p>
              ) : (
                <div className="reservations-list">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="reservation-card">
                      <div className="reservation-header">
                        <strong>
                          {reservation.propertyTitle ??
                            `Imóvel #${reservation.propertyId}`}
                        </strong>
                        <span
                          className={`status-badge status-${reservation.status.toLowerCase()}`}
                        >
                          {reservation.status}
                        </span>
                      </div>

                      <p className="reservation-guest">
                        {reservation.guestName} — {reservation.guestEmail}
                      </p>

                      <p className="reservation-dates">
                        {new Date(
                          reservation.checkIn
                        ).toLocaleDateString()}{" "}
                        até{" "}
                        {new Date(
                          reservation.checkOut
                        ).toLocaleDateString()}
                      </p>

                      <p className="reservation-meta">
                        Total:{" "}
                        <strong>
                          R$ {reservation.totalPrice.toFixed(2)}
                        </strong>{" "}
                        • criada em{" "}
                        {new Date(
                          reservation.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>

          {/* Coluna direita: lista de imóveis */}
          <section className="card list-card">
            {visibleProperties.length === 0 && !loading ? (
              <div className="empty-state">
                <p>
                  Nenhum imóvel cadastrado ainda. Use o botão{" "}
                  <strong>“Novo imóvel”</strong> para começar.
                </p>
              </div>
            ) : (
              <div className="properties-list">
                {visibleProperties.map((property) => (
                  <article key={property.id} className="property-card">
                    <header className="property-card-header">
                      <h3>{property.title}</h3>
                      <span
                        className={`status-badge status-${property.status
                          .toLowerCase()
                          .trim()}`}
                      >
                        {property.status === "AVAILABLE"
                          ? "Disponível"
                          : property.status === "BLOCKED"
                          ? "Bloqueado"
                          : property.status === "INACTIVE"
                          ? "Inativo"
                          : property.status}
                      </span>
                    </header>

                    <p className="property-location">{property.location}</p>
                    <p className="property-type">{property.type}</p>

                    <div className="property-meta">
                      <span>
                        🧍 Até <strong>{property.maxGuests}</strong> hóspedes
                      </span>
                      <span>
                        💰{" "}
                        <strong>
                          R{"$ "}
                          {property.nightlyPrice.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>{" "}
                        / noite
                      </span>
                    </div>

                    {property.description && (
                      <p className="property-description">
                        {property.description}
                      </p>
                    )}
                     <div className="property-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        Remover imóvel
                      </button>
                    </div>

                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        {/* Formulário para criar imóvel */}
        <section id="form-section" className="card form-card">
          <h2>Cadastrar novo imóvel</h2>
          <p className="form-subtitle">
            Preencha os campos principais para registrar um imóvel rapidamente.
          </p>

          <form className="property-form" onSubmit={handleCreateProperty}>
            <div className="form-row">
              <div className="form-field">
                <label>Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Casa Moana - Beira-mar"
                />
              </div>

              <div className="form-field">
                <label>Tipo</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Casa de praia, flat, chalé..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Localização</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Cidade / bairro"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Valor da diária (R$)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={nightlyPrice}
                  onChange={(e) => setNightlyPrice(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Capacidade máxima</label>
                <input
                  type="number"
                  min={1}
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Descrição</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Destaques do imóvel, diferenciais, observações..."
              />
            </div>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                Salvar imóvel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
