import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Récupère userId depuis l’URL après callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    if (id) setUserId(id);
  }, []);

  // Fonction pour fetch le “Now Playing”
  const fetchTrack = async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/spotify/current?userId=${userId}`);
    const data = await res.json();
    setTrack(data);
    setLoading(false);
  };

  // Rafraîchissement temps réel
  useEffect(() => {
    if (!userId) return;
    fetchTrack();
    // Actualise toutes les 5 secondes
    intervalRef.current = setInterval(fetchTrack, 5000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [userId]);

  // Animation “barres audio” façon Spotify
  const AudioBars = () => (
    <div style={{ display: 'flex', alignItems: 'end', height: 18, gap: 2, marginBottom: 18, justifyContent: "center" }}>
      {[7, 13, 9, 14, 6].map((h, i) => (
        <div key={i}
          style={{
            width: 3,
            height: h,
            background: "#1DB954",
            borderRadius: 2,
            animation: `wave 1s ${i * 0.12}s infinite cubic-bezier(.45,0,.55,1) alternate`
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          to { height: 18px }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 80% 10%,#1DB95433 0%,#191414 80%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      padding: 24
    }}>
      {!userId ? (
        <a href="/api/auth/spotify/login">
          <button style={{
            padding: "1rem 2.5rem",
            borderRadius: 999,
            background: "#1DB954",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            fontSize: "1.4rem",
            boxShadow: "0 2px 16px #1DB95422",
            transition: "transform .1s",
            cursor: "pointer"
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify logo" width={30} style={{ verticalAlign: "middle", marginRight: 16, filter: "invert(1)" }} />
            Connecter Spotify
          </button>
        </a>
      ) : (
        <div style={{
          background: "#181818dd",
          borderRadius: 24,
          boxShadow: "0 6px 40px #191414aa",
          padding: 32,
          width: "100%",
          maxWidth: 370,
          minWidth: 280,
          margin: "auto",
          textAlign: "center",
          color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <AudioBars />
          <button
            onClick={fetchTrack}
            disabled={loading}
            style={{
              marginBottom: 18,
              padding: "0.65rem 1.2rem",
              borderRadius: 999,
              background: "#1DB954",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "1.1rem",
              letterSpacing: 0.5,
              boxShadow: "0 2px 16px #1DB95422",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity .2s"
            }}
          >{loading ? "Chargement..." : "Rafraîchir"}</button>

          {!track?.item ? (
            <div style={{ color: "#ccc", marginTop: 12, fontStyle: "italic" }}>
              {loading ? "Chargement..." : "Aucune lecture détectée"}
            </div>
          ) : (
            <div>
              <img src={track.item.album.images[0].url} alt="album" width={210} height={210}
                style={{
                  borderRadius: 16,
                  boxShadow: "0 2px 30px #1DB95433, 0 1px 4px #0004",
                  marginBottom: 18
                }} />
              <h2 style={{
                fontSize: 21,
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 250,
                margin: "0 auto 4px auto"
              }}>
                {track.item.name}
              </h2>
              <div style={{
                color: "#1DB954",
                fontWeight: 600,
                fontSize: 17,
                marginBottom: 4
              }}>{track.item.artists.map(a => a.name).join(', ')}</div>
              <div style={{
                color: "#b6b6b6",
                fontSize: 15,
                marginBottom: 12
              }}>{track.item.album.name}</div>
              {track.item.preview_url ? (
                <audio
                  controls
                  src={track.item.preview_url}
                  style={{
                    marginTop: 12,
                    width: "92%",
                    borderRadius: 6,
                    outline: "none"
                  }}
                />
              ) : (
                <div style={{ color: "#aaa", marginTop: 12, fontSize: 13 }}>
                  Pas de preview audio disponible
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
