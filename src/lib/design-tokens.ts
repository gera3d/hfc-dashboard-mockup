export type TokenHex = `#${string}`

export type DesignTokens = {
	colors: {
		brand: {
			primary: TokenHex
			accent: TokenHex
			alert: TokenHex
		}
		neutral: {
			900: TokenHex
			800: TokenHex
			700: TokenHex
			600: TokenHex
			500: TokenHex
			400: TokenHex
			300: TokenHex
			200: TokenHex
			100: TokenHex
		}
		background: {
			app: string
			surface: string
			elevated: string
			subtle: string
			overlay: string
		}
		text: {
			primary: TokenHex
			secondary: TokenHex
			muted: TokenHex
			inverted: TokenHex
		}
		signal: {
			gold: TokenHex
			platinum: TokenHex
			positive: TokenHex
			caution: TokenHex
			negative: TokenHex
		}
		border: {
			subtle: string
			strong: string
		}
	}
	typography: {
		families: {
			display: string
			sans: string
			mono: string
		}
		weights: {
			regular: number
			medium: number
			semibold: number
			bold: number
		}
		lineHeights: {
			tight: number
			snug: number
			relaxed: number
		}
	}
	radii: {
		xs: string
		sm: string
		md: string
		lg: string
		xl: string
		pill: string
	}
	shadows: {
		soft: string
		elevated: string
		elevatedStrong: string
		overlay: string
	}
	motion: {
		duration: {
			instant: string
			short: string
			medium: string
			long: string
		}
		easing: {
			standard: string
			entrance: string
			exit: string
		}
	}
	spacing: {
		sectionX: string
		sectionY: string
		cardPadding: string
	}
}

export const designTokens: DesignTokens = {
	colors: {
		brand: {
			primary: "#635BFF", // Stripe's primary purple
			accent: "#00D4FF", // Bright accent blue
			alert: "#FF49DB", // Magenta for alerts
		},
		neutral: {
			900: "#0A2540", // Very dark blue (almost black)
			800: "#1A3356",
			700: "#384764",
			600: "#556987",
			500: "#6B7C93", // Stripe's primary text color
			400: "#8898AA", // Stripe's secondary text color
			300: "#A3ACB9",
			200: "#E3E8EE", // Stripe's light border color
			100: "#F7FAFC", // Very light background
		},
		background: {
			app: "#FFFFFF", // Clean white background 
			surface: "#FFFFFF", // White cards
			elevated: "#FFFFFF",
			subtle: "#F6F9FC", // Stripe's off-white background
			overlay: "rgba(10, 37, 64, 0.08)",
		},
		text: {
			primary: "#0A2540", // Dark blue-black
			secondary: "#6B7C93", // Medium gray-blue
			muted: "#8898AA", // Light gray-blue
			inverted: "#FFFFFF", // White text
		},
		signal: {
			gold: "#FFBF00", // Vibrant gold
			platinum: "#00D4FF", // Bright blue
			positive: "#00CA6F", // Green
			caution: "#FFAE33", // Amber
			negative: "#FF4A4C", // Red
		},
		border: {
			subtle: "#F6F9FC", // Very subtle border
			strong: "#E3E8EE", // Stripe's standard border color
		},
	},
	typography: {
		families: {
			display: "var(--font-display, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui)",
			sans: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui)",
			mono: "var(--font-mono, SFMono-Regular, Menlo, Consolas, monospace)",
		},
		weights: {
			regular: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
		lineHeights: {
			tight: 1.1,
			snug: 1.25,
			relaxed: 1.5, // Slightly tighter for Stripe look
		},
	},
	radii: {
		xs: "4px", // Stripe uses more subtle rounding
		sm: "6px",
		md: "8px", // Primary radius for most elements
		lg: "12px",
		xl: "16px",
		pill: "999px",
	},
	shadows: {
		soft: "0 2px 5px 0 rgba(60, 66, 87, 0.08), 0 1px 1px 0 rgba(0, 0, 0, 0.12)",  // Stripe card shadow
		elevated: "0 7px 14px 0 rgba(60, 66, 87, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.07)", // Medium elevation
		elevatedStrong: "0 15px 35px 0 rgba(60, 66, 87, 0.1), 0 5px 15px 0 rgba(0, 0, 0, 0.07)", // Higher elevation
		overlay: "0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)", // Modal shadow
	},
	motion: {
		duration: {
			instant: "50ms", // Stripe uses faster transitions
			short: "150ms",
			medium: "200ms",
			long: "300ms",
		},
		easing: {
			standard: "cubic-bezier(0.4, 0, 0.2, 1)",
			entrance: "cubic-bezier(0.16, 1, 0.29, 0.99)",
			exit: "cubic-bezier(0.35, 0, 0.65, 1)",
		},
	},
	spacing: {
		sectionX: "clamp(1.25rem, 3vw, 2.5rem)", // Stripe uses tighter horizontal spacing
		sectionY: "clamp(1.5rem, 4vw, 3rem)", // And more compact vertical spacing
		cardPadding: "clamp(1.25rem, 2vw, 2rem)",
	},
}

export type ThemeMode = "light" | "dark"

