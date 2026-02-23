import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

  // formulário de imóvel
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [nightlyPrice, setNightlyPrice] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [description, setDescription] = useState("");

  // filtros
  const [filter, setFilter] = useState<Filter>("ALL");

  // reservas (lista + form rápido)
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const [reservationPropertyId, setReservationPropertyId] = useState<
    number | ""
  >("");
  const [reservationGuestName, setReservationGuestName] = useState("");
  const [reservationGuestEmail, setReservationGuestEmail] = useState("");
  const [reservationCheckIn, setReservationCheckIn] = useState("");
  const [reservationCheckOut, setReservationCheckOut] = useState("");
  const [savingReservation, setSavingReservation] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reservationMessage, setReservationMessage] = useState<string | null>(
    null
  );

  // hoje (para calcular reservas futuras)
  const today = new Date();

  const upcomingReservations = reservations
    .filter((reservation) => {
      const checkOutDate = new Date(reservation.checkOut);
      return checkOutDate >= today;
    })
    .sort((a, b) => {
      return (
        new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
      );
    })
    .slice(0, 5);

  const totalUpcomingRevenue = upcomingReservations.reduce(
    (sum, r) => sum + r.totalPrice,
    0
  );

  // preview da reserva rápida
  const selectedReservationProperty =
    reservationPropertyId &&
    properties.find((p) => p.id === reservationPropertyId);

  let reservationNights = 0;
  let reservationEstimatedTotal = 0;

  if (
    reservationCheckIn &&
    reservationCheckOut &&
    selectedReservationProperty
  ) {
    const checkInDate = new Date(reservationCheckIn);
    const checkOutDate = new Date(reservationCheckOut);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 0) {
      reservationNights = diffDays;
      reservationEstimatedTotal =
        selectedReservationProperty.nightlyPrice * diffDays;
    }
  }

  const isReservationFormValid =
    !!reservationPropertyId &&
    reservationGuestName.trim().length > 0 &&
    reservationGuestEmail.trim().length > 0 &&
    !!reservationCheckIn &&
    !!reservationCheckOut;

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
    } finally {
      setLoadingReservations(false);
    }
  }

  // aplica filtro por status
  const visibleProperties = properties.filter((p) => {
    if (filter === "ALL") return true;
    if (filter === "AVAILABLE") return p.status === "AVAILABLE";
    if (filter === "BLOCKED") return p.status === "BLOCKED";
    return true;
  });

  // ordena para deixar disponíveis no topo
  const sortedVisibleProperties = [...visibleProperties].sort((a, b) => {
    const orderForStatus = (status: PropertyStatus) => {
      const s = typeof status === "string" ? status.toUpperCase().trim() : "";
      if (s === "AVAILABLE") return 0;
      if (s === "BLOCKED") return 1;
      if (s === "INACTIVE") return 2;
      return 3;
    };

    const statusDiff =
      orderForStatus(a.status) - orderForStatus(b.status);

    if (statusDiff !== 0) return statusDiff;

    // se tiver mesmo "peso" de status, ordena alfabeticamente pelo título
    return a.title.localeCompare(b.title);
  });

  // contadores básicos de imóveis
  const totalProperties = properties.length;
  const totalAvailable = properties.filter(
    (p) => p.status === "AVAILABLE"
  ).length;
  const totalBlocked = properties.filter(
    (p) => p.status === "BLOCKED"
  ).length;

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

      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro inesperado ao remover imóvel");
    }
  }

  async function handleChangePropertyStatus(
    id: number,
    newStatus: PropertyStatus
  ) {
    try {
      setError(null);

      const res = await fetch(`${API_BASE_URL}/properties/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar status do imóvel");
      }

      let updatedProperty: Property | null = null;
      try {
        updatedProperty = (await res.json()) as Property;
      } catch {
        updatedProperty = null;
      }

      setProperties((prev) =>
        prev.map((p) =>
          p.id === id
            ? updatedProperty
              ? updatedProperty
              : { ...p, status: newStatus }
            : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ?? "Erro inesperado ao atualizar status do imóvel"
      );
    }
  }

  async function handleCreateReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isReservationFormValid) {
      setReservationError("Preencha todos os campos da reserva.");
      setReservationMessage(null);
      return;
    }

    try {
      setSavingReservation(true);
      setReservationError(null);
      setReservationMessage(null);

      const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: reservationPropertyId,
          guestName: reservationGuestName.trim(),
          guestEmail: reservationGuestEmail.trim(),
          checkIn: reservationCheckIn,
          checkOut: reservationCheckOut,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro ao criar reserva");
      }

      await loadReservations();

      setReservationMessage("Reserva criada com sucesso 🎉");
      setReservationPropertyId("");
      setReservationGuestName("");
      setReservationGuestEmail("");
      setReservationCheckIn("");
      setReservationCheckOut("");
    } catch (err: any) {
      console.error(err);
      const msg = String(err?.message ?? "");

      if (msg.includes("There is already a reservation")) {
        setReservationError(
          "Já existe uma reserva nesse período para esse imóvel."
        );
      } else if (msg.includes("Property not found")) {
        setReservationError(
          "Imóvel não encontrado. Atualize a página e tente novamente."
        );
      } else if (msg.includes("checkOut must be after checkIn")) {
        setReservationError("O check-out precisa ser depois do check-in.");
      } else if (msg.includes("Property is not available for booking")) {
        setReservationError(
          "Esse imóvel não está disponível para reserva no momento."
        );
      } else {
        setReservationError("Erro inesperado ao criar reserva.");
      }

      setReservationMessage(null);
    } finally {
      setSavingReservation(false);
    }
  }

  useEffect(() => {
    loadProperties();
    loadReservations();
  }, []);

  return (
    <div className="app-root">
      {/* SIDEBAR */}
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

        {/* PRÓXIMAS RESERVAS NA LATERAL ESQUERDA */}
        <section className="sidebar-reservations">
          <h3>Próximas reservas</h3>
          <p className="sidebar-reservations-subtitle">
            Visão rápida das próximas reservas já cadastradas no sistema.
          </p>

          {loadingReservations ? (
            <p className="sidebar-reservations-loading">
              Carregando reservas...
            </p>
          ) : upcomingReservations.length === 0 ? (
            <p className="empty-state sidebar-empty">
              Nenhuma reserva futura cadastrada ainda. Depois vamos permitir
              criar reservas direto daqui. 😉
            </p>
          ) : (
            <div className="reservations-list">
              {upcomingReservations.map((reservation) => (
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

        {/* RESUMO GERAL (chips) */}
        <section className="sidebar-summary">
          <div className="summary-pill">
            <span className="summary-label">Imóveis cadastrados</span>
            <span className="summary-value">{totalProperties}</span>
          </div>
          <div className="summary-pill">
            <span className="summary-label">Reservas futuras</span>
            <span className="summary-value">
              {upcomingReservations.length}
            </span>
          </div>
          <div className="summary-pill">
            <span className="summary-label">Receita estimada</span>
            <span className="summary-value">
              R{"$ "}
              {totalUpcomingRevenue.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </section>

        {/* FILTROS NA SIDEBAR */}
        <section className="card filters-card sidebar-filters">
          <h2>Filtros</h2>

          <div className="filters-summary">
            <span>
              Total: <strong>{totalProperties}</strong>
            </span>
            <span>
              Disponíveis: <strong>{totalAvailable}</strong>
            </span>
            <span>
              Bloqueados: <strong>{totalBlocked}</strong>
            </span>
          </div>

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
        </section>
      </aside>

      {/* MAIN */}
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Imóveis cadastrados</h1>
            <p>
              {properties.length === 0
                ? "Nenhum imóvel cadastrado nesta página."
                : `Encontramos ${sortedVisibleProperties.length} imóvel(is) nesta página.`}
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

        {/* 1) LISTA DE IMÓVEIS (EM GRID) – AGORA NO TOPO */}
        <section className="card list-card">
          {sortedVisibleProperties.length === 0 && !loading ? (
            <div className="empty-state">
              <p>
                Nenhum imóvel cadastrado ainda. Use o botão{" "}
                <strong>“Novo imóvel”</strong> para começar.
              </p>
            </div>
          ) : (
            <div className="properties-list">
              {sortedVisibleProperties.map((property) => (
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

                  {/* controle de status dentro do card */}
                  <div className="property-status-row">
                    <span>Status:</span>
                    <select
                      className="property-status-select"
                      value={property.status}
                      onChange={(e) =>
                        handleChangePropertyStatus(
                          property.id,
                          e.target.value as PropertyStatus
                        )
                      }
                    >
                      <option value="AVAILABLE">Disponível</option>
                      <option value="BLOCKED">Bloqueado</option>
                      <option value="INACTIVE">Inativo</option>
                    </select>
                  </div>

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

        {/* 2) FORMULÁRIO DE RESERVA RÁPIDA */}
        <section className="card reservation-form-wrapper">
          <h3>Criar reserva rápida</h3>
          <p className="form-subtitle">
            Escolha um imóvel e um período para testar o fluxo de reservas.
          </p>

          <form
            className="reservation-form"
            onSubmit={handleCreateReservation}
          >
            <div className="form-field">
              <label>Imóvel</label>
              <select
                value={reservationPropertyId}
                onChange={(e) =>
                  setReservationPropertyId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">Selecione um imóvel</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title || `Imóvel #${p.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Nome do hóspede</label>
              <input
                type="text"
                value={reservationGuestName}
                onChange={(e) => setReservationGuestName(e.target.value)}
                placeholder="Ex: Gabriela Wanderley"
              />
            </div>

            <div className="form-field">
              <label>E-mail do hóspede</label>
              <input
                type="email"
                value={reservationGuestEmail}
                onChange={(e) => setReservationGuestEmail(e.target.value)}
                placeholder="contato@exemplo.com"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Check-in</label>
                <input
                  type="date"
                  value={reservationCheckIn}
                  onChange={(e) => setReservationCheckIn(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Check-out</label>
                <input
                  type="date"
                  value={reservationCheckOut}
                  onChange={(e) => setReservationCheckOut(e.target.value)}
                />
              </div>
            </div>

            {/* preview da reserva */}
            {reservationNights > 0 && selectedReservationProperty && (
              <div className="reservation-preview">
                <p>
                  Reserva para{" "}
                  <strong>{selectedReservationProperty.title}</strong> —{" "}
                  <strong>{reservationNights}</strong> noite(s), total
                  estimado{" "}
                  <strong>
                    R{"$ "}
                    {reservationEstimatedTotal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                  .
                </p>
              </div>
            )}

            {reservationError && (
              <p className="reservation-error">{reservationError}</p>
            )}
            {reservationMessage && (
              <p className="reservation-success">
                {reservationMessage}
              </p>
            )}

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={savingReservation || !isReservationFormValid}
              >
                {savingReservation ? "Salvando..." : "Criar reserva"}
              </button>
            </div>
          </form>
        </section>

        {/* 3) FORMULÁRIO PARA CRIAR IMÓVEL */}
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