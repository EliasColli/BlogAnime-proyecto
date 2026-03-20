tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Colores combinados (AniVibe + SecureAccess)
                "surface": "#060e20",
                "background": "#060e20",
                "primary": "#81ecff",
                "primary-dim": "#00d4ec",
                "secondary": "#ff7520",
                "tertiary": "#e966ff",
                "on-surface": "#dee5ff",
                "on-surface-variant": "#a3aac4",
                "outline": "#6d758c",
                "outline-variant": "#40485d",
                
                // Contenedores específicos de SecureAccess
                "surface-container-low": "#091328",
                "surface-container-high": "#141f38",
                "primary-container": "#00e3fd",
                "tertiary-container": "#d501f9",
                
                // Estados adicionales
                "error": "#ff716c",
                "secondary-fixed": "#ffc5aa",
                "secondary-container": "#9f4200"
            },
            fontFamily: {
                "headline": ["Space Grotesk", "sans-serif"],
                "body": ["Manrope", "Inter", "sans-serif"],
                "label": ["Be Vietnam Pro", "Space Grotesk", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0px",
                "lg": "0px",
                "xl": "0px",
                "full": "9999px"
            }
        }
    }
};

// Inicialización del sistema
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistemas combinados: SECURE_ACCESS + AniVibe cargados.");
    
    // Ejemplo: Manejador de formularios si existen
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Acción de formulario detectada.");
        });
    });
});