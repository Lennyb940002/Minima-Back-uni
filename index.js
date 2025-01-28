import React, { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);//
    setErrorMessage("");
    setSubmitStatus(null);

    try {
      // Enlever le slash à la fin si présent
      const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setErrorMessage(data.error || "Cet email est déjà inscrit.");
        } else {
          setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
        }
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      setEmail("");
    } catch (error) {
      setErrorMessage("Erreur de connexion avec le serveur.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Inscription à la Newsletter</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isSubmitting ? "Chargement..." : "S'inscrire"}
        </button>
      </form>

      {submitStatus === "success" && (
        <p style={{ color: "green", marginTop: "1rem" }}>Inscription réussie !</p>
      )}
      {submitStatus === "error" && (
        <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
      )}
    </div>
  );
}

export default App;
