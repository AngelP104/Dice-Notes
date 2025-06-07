
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Footer de la aplicación
export const Footer = () => {
    return (
        <div class="min-h-screen">
            <footer className="w-full py-4 font-semibold text-sm text-gray-400 p-6 sticky top-full text-center bg-[#1a1a1a] border-t border-gray-600 flex flex-col items-center gap-2">
                <div>
                    © Dice & Notes, 2025
                </div>
                <div className="flex items-center gap-4">
                    <a href="https://github.com/AngelP104" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                        <i className="fab fa-github text-xl transition hover:scale-110"></i>
                    </a>
                </div>
            </footer>

        </div>


    )
}
