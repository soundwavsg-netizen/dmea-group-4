{
  "meta": {
    "app_name": "MUFE Group 4 – User Research + Persona Generator",
    "brand_attributes": ["professional", "methodical", "beauty-first", "trustworthy", "warm"],
    "audience": ["UX researchers", "consumer insight analysts", "product managers in beauty/makeup"],
    "primary_tasks": [
      "Design and launch multi-step research studies",
      "Collect responses and annotate insights (tags/notes)",
      "Generate data-driven personas",
      "Visualize metrics in dashboards and reports",
      "Export/share findings"
    ],
    "success_actions": [
      "Study created and published",
      "Responses imported/synced",
      "Personas generated and saved",
      "Report exported as PDF/CSV",
      "Stakeholders invited"
    ]
  },

  "typography": {
    "font_pairing": {
      "display_headings": "Space Grotesk",
      "body_ui": "Manrope"
    },
    "how_to_add_fonts": [
      "Add to index.html <head>: \n<link href=\"https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap\" rel=\"stylesheet\">",
      "Update tailwind.config.js theme.extend.fontFamily: \nfontFamily: { sans: ['Manrope', 'ui-sans-serif', 'system-ui'], display: ['Space Grotesk', 'ui-sans-serif'] }",
      "Usage: apply font-display for H1/H2, font-sans for body"
    ],
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight leading-[1.1]",
      "h2": "text-base md:text-lg font-display tracking-tight",
      "h3": "text-lg md:text-xl font-display",
      "body": "text-sm md:text-base font-sans leading-7",
      "small": "text-xs md:text-sm text-muted-foreground"
    }
  },

  "color_system": {
    "preserve_existing": {
      "primary_hex": "#A62639",
      "accent_hex": "#E0AFA0"
    },
    "extended_palette": {
      "background": "#F8F6F5",
      "surface": "#FFFFFF",
      "ink": "#1F1A1A",
      "muted_ink": "#6C5F5F",
      "burgundy_700": "#8E1F31",
      "burgundy_900": "#611623",
      "rose_200": "#F1D6CD",
      "rose_100": "#F7E8E3",
      "sand_100": "#F3ECE7",
      "graphite_700": "#2F2A2A",
      "success_600": "#2E7D32",
      "warning_600": "#B26A00",
      "info_600": "#1769AA",
      "error_600": "#C62828"
    },
    "charts": {
      "series": ["#A62639", "#E0AFA0", "#2E7D32", "#1769AA", "#B26A00"],
      "qualitative_soft": ["#F1D6CD", "#EEDFD7", "#EBD9D4", "#E7D2CF", "#E0AFA0"]
    },
    "shadcn_hsl_tokens": {
      "instructions": "Replace :root tokens in /app/frontend/src/index.css with below to align theme.",
      "root": {
        "--background": "18 28% 97%",           
        "--foreground": "0 6% 12%",
        "--card": "0 0% 100%",
        "--card-foreground": "0 6% 12%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "0 6% 12%",
        "--primary": "350 62% 40%",              
        "--primary-foreground": "0 0% 100%",
        "--secondary": "17 43% 78%",             
        "--secondary-foreground": "0 6% 12%",
        "--muted": "14 24% 93%",
        "--muted-foreground": "0 6% 40%",
        "--accent": "17 43% 78%",                
        "--accent-foreground": "0 6% 12%",
        "--destructive": "0 64% 43%",
        "--destructive-foreground": "0 0% 98%",
        "--border": "14 18% 88%",
        "--input": "14 18% 88%",
        "--ring": "350 62% 40%",
        "--radius": "0.625rem",
        "--chart-1": "350 62% 40%",
        "--chart-2": "17 43% 63%",
        "--chart-3": "147 44% 33%",
        "--chart-4": "205 74% 41%",
        "--chart-5": "40 100% 35%"
      },
      "dark": {
        "--background": "0 6% 8%",
        "--foreground": "0 0% 98%",
        "--card": "0 6% 10%",
        "--card-foreground": "0 0% 98%",
        "--popover": "0 6% 10%",
        "--popover-foreground": "0 0% 98%",
        "--primary": "350 62% 52%",
        "--primary-foreground": "0 6% 10%",
        "--secondary": "350 29% 20%",
        "--secondary-foreground": "0 0% 98%",
        "--muted": "0 6% 15%",
        "--muted-foreground": "0 0% 70%",
        "--accent": "350 29% 20%",
        "--accent-foreground": "0 0% 98%",
        "--destructive": "0 65% 45%",
        "--destructive-foreground": "0 0% 100%",
        "--border": "0 6% 18%",
        "--input": "0 6% 18%",
        "--ring": "350 62% 52%",
        "--chart-1": "350 62% 52%",
        "--chart-2": "17 43% 63%",
        "--chart-3": "147 44% 40%",
        "--chart-4": "205 74% 50%",
        "--chart-5": "40 100% 45%"
      }
    }
  },

  "gradients_and_texture": {
    "rules": "Follow Gradient Restriction Rule strictly (see general_guidelines). Max 20% viewport, not on text blocks.",
    "combos": [
      {
        "name": "Rose Mist",
        "css": "bg-[linear-gradient(135deg,_rgba(240,223,217,1)_0%,_rgba(247,232,227,1)_50%,_rgba(243,236,231,1)_100%)]",
        "usage": "Hero section background only"
      },
      {
        "name": "Peach Linen",
        "css": "bg-[linear-gradient(180deg,_rgba(224,175,160,0.25)_0%,_rgba(248,246,245,0.0)_60%)]",
        "usage": "Section top fade (decorative overlay)"
      },
      {
        "name": "Blush Edge",
        "css": "bg-[linear-gradient(90deg,_rgba(166,38,57,0.06)_0%,_rgba(247,232,227,0)_40%)]",
        "usage": "Accent strip behind page titles"
      }
    ],
    "noise_overlay": {
      "class": "after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'160\\'><filter id=\\'n\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.8\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/></filter><rect filter=\\'url(%23n)\\' opacity=\\'0.025\\' width=\\'100%\\' height=\\'100%\\'/></svg>')]"
    }
  },

  "grid_and_layout": {
    "container": "max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8",
    "page_shell": {
      "header": "sticky top-0 z-40 bg-background/80 backdrop-blur border-b",
      "sidebar": "hidden lg:block w-[280px] shrink-0 border-r bg-card",
      "content": "min-h-screen flex-1"
    },
    "patterns": [
      {
        "name": "Dashboard",
        "structure": "lg:grid lg:grid-cols-[280px_1fr]",
        "content_grid": "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 md:gap-6",
        "cards": "xl:col-span-3 md:col-span-1"
      },
      {
        "name": "Bento Analytics",
        "content_grid": "grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-5",
        "examples": [
          "KPI card xl:col-span-3 md:col-span-3",
          "Chart xl:col-span-6 md:col-span-6",
          "Insights list xl:col-span-3 md:col-span-3"
        ]
      },
      {
        "name": "Split Form",
        "structure": "lg:grid lg:grid-cols-[1fr_420px] gap-8",
        "usage": "Multi-step study builder with live preview"
      }
    ]
  },

  "components": {
    "navigation": {
      "topbar": {
        "uses": ["./frontend/src/components/ui/navigation-menu.jsx", "./frontend/src/components/ui/menubar.jsx", "./frontend/src/components/ui/avatar.jsx", "./frontend/src/components/ui/badge.jsx", "./frontend/src/components/ui/button.jsx"],
        "notes": "Keep actions (New Study, Export) right-aligned. Primary buttons use bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white."
      },
      "sidebar": {
        "uses": ["./frontend/src/components/ui/navigation-menu.jsx", "./frontend/src/components/ui/separator.jsx"],
        "style": "text-sm text-muted-foreground hover:text-foreground data-[active=true]:text-foreground",
        "micro": "Active item shows a 3px left border in primary."
      }
    },
    "cards_and_containers": {
      "card": {
        "uses": ["./frontend/src/components/ui/card.jsx", "./frontend/src/components/ui/separator.jsx"],
        "class": "bg-card border rounded-xl shadow-sm hover:shadow-md transition-[box-shadow,background-color] duration-200",
        "states": "Selected card adds ring-2 ring-[hsl(var(--ring))] ring-offset-2"
      },
      "persona_card": {
        "layout": "grid grid-cols-[80px_1fr] gap-4",
        "header": "flex items-center gap-3",
        "body": "grid grid-cols-2 md:grid-cols-4 gap-3",
        "chips": "./frontend/src/components/ui/badge.jsx",
        "avatar": "./frontend/src/components/ui/avatar.jsx",
        "style": "bg-white border rounded-xl p-4 md:p-5",
        "data_points": ["Name", "Age", "Skin type", "Makeup goals", "Preferred finishes", "Budget"],
        "example_state": "data-testid=\"persona-card\""
      }
    },
    "forms": {
      "multi_step": {
        "uses": ["./frontend/src/components/ui/form.jsx", "./frontend/src/components/ui/input.jsx", "./frontend/src/components/ui/textarea.jsx", "./frontend/src/components/ui/select.jsx", "./frontend/src/components/ui/radio-group.jsx", "./frontend/src/components/ui/checkbox.jsx", "./frontend/src/components/ui/slider.jsx", "./frontend/src/components/ui/tabs.jsx", "./frontend/src/components/ui/progress.jsx", "./frontend/src/components/ui/calendar.jsx", "./frontend/src/components/ui/popover.jsx", "./frontend/src/components/ui/button.jsx", "./frontend/src/components/ui/sonner.jsx"],
        "pattern": "Use Tabs or a custom stepper above, with Progress below. Persist draft at each step.",
        "field_style": "rounded-md bg-white placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-[hsl(var(--ring))]",
        "validation": "Inline with help text using text-[hsl(var(--destructive))] where needed"
      },
      "filters": {
        "uses": ["./frontend/src/components/ui/command.jsx", "./frontend/src/components/ui/select.jsx", "./frontend/src/components/ui/popover.jsx", "./frontend/src/components/ui/calendar.jsx", "./frontend/src/components/ui/checkbox.jsx", "./frontend/src/components/ui/switch.jsx"],
        "behavior": "Sticky filter bar under header on dashboard routes"
      }
    },
    "feedback": {
      "toast": {
        "uses": ["./frontend/src/components/ui/sonner.jsx", "./frontend/src/components/ui/toaster.jsx"],
        "pattern": "Use success for saves, info for persona generated, warning for partial data, destructive for errors",
        "example": "<Toaster position=\"top-right\" richColors closeButton />"
      },
      "skeleton": {
        "uses": ["./frontend/src/components/ui/skeleton.jsx"]
      }
    },
    "data_display": {
      "table": {
        "uses": ["./frontend/src/components/ui/table.jsx", "./frontend/src/components/ui/scroll-area.jsx"],
        "pattern": "Sticky header, zebra rows (even:bg-muted/40), row hover bg-muted",
        "testid": "data-testid=\"responses-table\""
      },
      "tabs": {
        "uses": ["./frontend/src/components/ui/tabs.jsx"],
        "pattern": "Underline indicator in primary; use data-testid per tab button"
      }
    },
    "actions": {
      "buttons": {
        "variants": {
          "primary": "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
          "secondary": "bg-[hsl(var(--secondary))] text-foreground hover:bg-[hsl(var(--secondary))]/80",
          "ghost": "bg-transparent hover:bg-muted",
          "destructive": "bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive))]/90"
        },
        "shape": "rounded-[var(--btn-radius,10px)]",
        "sizes": {
          "sm": "h-9 px-4 text-sm",
          "md": "h-11 px-5",
          "lg": "h-12 px-6 text-base"
        },
        "motion": "transition-colors duration-200 will-change:background-color"
      }
    }
  },

  "charts": {
    "library": "Recharts",
    "install": "npm i recharts",
    "principles": [
      "Use soft grid lines stroke-[#E8E2DE]",
      "Axes labels in text-xs text-muted-foreground",
      "Series colors pulled from tokens (charts.series)"
    ],
    "scaffold": "import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart, Bar, BarChart } from 'recharts';\n// Example\n<ResponsiveContainer width=\"100%\" height={260} data-testid=\"kpi-chart\">\n  <LineChart data={data}>\n    <CartesianGrid stroke=\"#E8E2DE\" strokeDasharray=\"3 3\" />\n    <XAxis dataKey=\"label\" tick={{ fontSize: 12, fill: '#6C5F5F' }} />\n    <YAxis tick={{ fontSize: 12, fill: '#6C5F5F' }} />\n    <Tooltip />\n    <Line type=\"monotone\" dataKey=\"value\" stroke=\"#A62639\" strokeWidth={2} dot={false} />\n  </LineChart>\n</ResponsiveContainer>"
  },

  "motion": {
    "library": "framer-motion",
    "install": "npm i framer-motion",
    "usage": [
      "Fade+rise for cards on scroll",
      "Micro hover lift on buttons and cards (scale-103 with y-[-1px])",
      "Tabs underline slide"
    ],
    "scaffold": "import { motion } from 'framer-motion';\n<motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, ease: 'easeOut' }}>...</motion.div>"
  },

  "micro_interactions": {
    "hover_states": [
      "Buttons: color shift only (no transition: all). Use transition-colors duration-200",
      "Cards: shadow-sm -> shadow-md on hover, with subtle y-translate using framer-motion"
    ],
    "scroll": [
      "Header gains border and bg-opacity on scroll",
      "Section titles reveal with small underline grow"
    ]
  },

  "accessibility": {
    "contrast": "Maintain AA: body on background >= 4.5:1; primary on white passes",
    "focus": "Visible 2px ring using --ring. Do not remove outlines.",
    "reduced_motion": "Respect prefers-reduced-motion, disable large animations",
    "touch_targets": ">=44px for interactive elements"
  },

  "testing_and_conventions": {
    "data_testid_rule": "All interactive and key informational elements MUST include data-testid in kebab-case focusing on role not style.",
    "examples": [
      "data-testid=\"new-study-primary-button\"",
      "data-testid=\"study-builder-next-step-button\"",
      "data-testid=\"responses-table\"",
      "data-testid=\"persona-card\"",
      "data-testid=\"export-report-menu-item\""
    ]
  },

  "routes_and_layouts": {
    "routes": [
      {
        "route": "/dashboard",
        "goal": "Overview of studies, KPIs, top insights",
        "layout": "Bento grid with 6–12 columns on xl",
        "blocks": [
          "KPI cards (Studies, Participants, Completion %, Avg. Satisfaction)",
          "Trend chart (Responses over time)",
          "Top tags (badges with counts)",
          "Recent personas (horizontal list)"
        ]
      },
      {
        "route": "/studies",
        "goal": "Create/manage multi-step studies",
        "layout": "Split Form: builder left, live preview right",
        "components": ["Tabs for steps", "Progress", "Form fields", "Calendar for scheduling"]
      },
      {
        "route": "/responses",
        "goal": "Review and tag responses",
        "layout": "Table with sticky filters top",
        "components": ["Table", "Command palette for tag filtering", "Drawer for detail view"]
      },
      {
        "route": "/personas",
        "goal": "Generate and curate personas",
        "layout": "Grid of persona_card",
        "components": ["Card", "Avatar", "Badge", "Dialog for details"]
      },
      {
        "route": "/reports",
        "goal": "Share/export analytics",
        "layout": "Two-column: charts + insights list",
        "components": ["Card", "Tabs", "Select for time range", "Button for Export"]
      }
    ]
  },

  "image_urls": [
    {
      "url": "https://images.unsplash.com/photo-1512053517780-b14891c7d582?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjB1c2FiaWxpdHklMjB0ZXN0aW5nJTIwc2Vzc2lvbiUyMHByb2Zlc3Npb25hbCUyMGxhYnxlbnwwfHx8fDE3NjM3MzA5MTJ8MA&ixlib=rb-4.1.0&q=85",
      "category": "personas",
      "description": "Makeup application close-up for persona cards"
    },
    {
      "url": "https://images.unsplash.com/photo-1757858176165-f4f1f0a2df58?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxtYWtldXAlMjB1c2FiaWxpdHklMjB0ZXN0aW5nJTIwc2Vzc2lvbiUyMHByb2Zlc3Npb25hbCUyMGxhYnxlbnwwfHx8fDE3NjM3MzA5MTJ8MA&ixlib=rb-4.1.0&q=85",
      "category": "hero",
      "description": "Research session vibe for hero/header"
    },
    {
      "url": "https://images.unsplash.com/photo-1645017324561-5de0e0739ec9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxtYWtldXAlMjB1c2FiaWxpdHklMjB0ZXN0aW5nJTIwc2Vzc2lvbiUyMHByb2Zlc3Npb25hbCUyMGxhYnxlbnwwfHx8fDE3NjM3MzA5MTJ8MA&ixlib=rb-4.1.0&q=85",
      "category": "empty_states",
      "description": "Use in dashboard empty state or onboarding"
    },
    {
      "url": "https://images.unsplash.com/photo-1594903696739-2551e8c2d0f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxtYWtldXAlMjB1c2FiaWxpdHklMjB0ZXN0aW5nJTIwc2Vzc2lvbiUyMHByb2Zlc3Npb25hbCUyMGxhYnxlbnwwfHx8fDE3NjM3MzA5MTJ8MA&ixlib=rb-4.1.0&q=85",
      "category": "illustrative",
      "description": "Brush + palette macro for decorative slots"
    },
    {
      "url": "https://images.pexels.com/photos/8533081/pexels-photo-8533081.jpeg",
      "category": "reports",
      "description": "Lab setting for analytics/report header"
    }
  ],

  "component_path": {
    "button": "./frontend/src/components/ui/button.jsx",
    "card": "./frontend/src/components/ui/card.jsx",
    "badge": "./frontend/src/components/ui/badge.jsx",
    "avatar": "./frontend/src/components/ui/avatar.jsx",
    "tabs": "./frontend/src/components/ui/tabs.jsx",
    "form": "./frontend/src/components/ui/form.jsx",
    "input": "./frontend/src/components/ui/input.jsx",
    "textarea": "./frontend/src/components/ui/textarea.jsx",
    "select": "./frontend/src/components/ui/select.jsx",
    "radio_group": "./frontend/src/components/ui/radio-group.jsx",
    "checkbox": "./frontend/src/components/ui/checkbox.jsx",
    "slider": "./frontend/src/components/ui/slider.jsx",
    "calendar": "./frontend/src/components/ui/calendar.jsx",
    "popover": "./frontend/src/components/ui/popover.jsx",
    "progress": "./frontend/src/components/ui/progress.jsx",
    "dialog": "./frontend/src/components/ui/dialog.jsx",
    "drawer": "./frontend/src/components/ui/drawer.jsx",
    "table": "./frontend/src/components/ui/table.jsx",
    "command": "./frontend/src/components/ui/command.jsx",
    "navigation_menu": "./frontend/src/components/ui/navigation-menu.jsx",
    "menubar": "./frontend/src/components/ui/menubar.jsx",
    "skeleton": "./frontend/src/components/ui/skeleton.jsx",
    "separator": "./frontend/src/components/ui/separator.jsx",
    "tooltip": "./frontend/src/components/ui/tooltip.jsx",
    "sonner": "./frontend/src/components/ui/sonner.jsx",
    "toaster": "./frontend/src/components/ui/toaster.jsx"
  },

  "design_tokens": {
    "css_custom_properties": ":root{ --btn-radius: 10px; --btn-shadow: 0 6px 16px rgba(166,38,57,0.15); --elev-1: 0 1px 2px rgba(0,0,0,0.05); --elev-2: 0 4px 12px rgba(0,0,0,0.06); --panel-radius: 12px; }",
    "shadow_classes": {
      "elev1": "shadow-[var(--elev-1)]",
      "elev2": "shadow-[var(--elev-2)]"
    },
    "radii": {
      "panel": "rounded-[var(--panel-radius)]",
      "button": "rounded-[var(--btn-radius)]"
    },
    "spacing": {
      "section_y": "py-10 md:py-14",
      "block_gap": "gap-5 md:gap-6"
    }
  },

  "button_system": {
    "style_family": "Luxury / Elegant",
    "variants": ["primary", "secondary", "ghost", "destructive"],
    "sizes": ["sm", "md", "lg"],
    "rules": [
      "Use rounded corners 8–12px",
      "Gentle fade/scale transitions using framer-motion or CSS transitions",
      "Always provide a visible focus ring"
    ]
  },

  "empty_states": {
    "dashboard": {
      "icon": "./frontend/src/components/ui/tooltip.jsx",
      "copy": "No responses yet. Invite participants or import data.",
      "action": "Primary button: Import Responses",
      "testid": "data-testid=\"dashboard-empty\""
    }
  },

  "libraries": {
    "recharts": "npm i recharts",
    "framer_motion": "npm i framer-motion",
    "lottie_optional": "npm i lottie-react"
  },

  "navigation_structure": {
    "header": ["Logo", "Search (command palette)", "New Study", "User Menu"],
    "sidebar": ["Dashboard", "Studies", "Responses", "Personas", "Reports", "Settings"]
  },

  "forms_and_validation_details": {
    "input_states": {
      "default": "bg-white border-border",
      "focus": "ring-2 ring-[hsl(var(--ring))] border-transparent",
      "invalid": "border-[hsl(var(--destructive))] text-[hsl(var(--destructive))]"
    },
    "helper_text": "text-xs text-muted-foreground mt-1",
    "required_mark": "after:content-['*'] after:text-[hsl(var(--destructive))] after:ml-0.5"
  },

  "persona_generator_view": {
    "header": "Title + filters (age range, skin type, budget)",
    "grid": "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5",
    "card_visuals": "Avatar + key traits badges in accent; progress bars for confidence",
    "actions": ["Save Persona", "Export", "Open Details (Dialog)"]
  },

  "reporting_view": {
    "time_range_select": "./frontend/src/components/ui/select.jsx",
    "export_menu": "./frontend/src/components/ui/dropdown-menu.jsx",
    "chart_stack": ["Line for trends", "Bar for distribution", "Pie (if needed)"],
    "notes_list": "Use ./frontend/src/components/ui/scroll-area.jsx for long lists"
  },

  "instructions_to_main_agent": [
    "1) Update /app/frontend/src/index.css :root and .dark tokens with values in color_system.shadcn_hsl_tokens",
    "2) Build header + sidebar shell following grid_and_layout.page_shell",
    "3) Implement Dashboard route with bento cards and a Recharts trend chart",
    "4) Implement Studies builder using Tabs + Progress + Form fields; include Calendar for scheduling",
    "5) Implement Responses table with sticky filter bar and Drawer for detail view",
    "6) Implement Personas grid using persona_card spec; ensure data-testid on each card",
    "7) Implement Reports with tabs to switch metrics; include Export via dropdown-menu",
    "8) Apply micro_interactions and motion using framer-motion; do not use transition: all",
    "9) Use Sonner toasts for saves/errors and place <Toaster /> at app root",
    "10) Ensure every interactive element has data-testid (kebab-case, role-oriented)"
  ],

  "web_inspirations": {
    "notes": "Sourced from Dovetail-style research dashboards, Maze-like survey flows, persona card patterns on Dribbble, and beauty dashboards. Use them for layout and hierarchy, but keep MUFE palette.",
    "references": [
      "https://dribbble.com/tags/user-research",
      "https://dribbble.com/tags/analytics-ui",
      "https://dribbble.com/search/user-persona",
      "https://muz.li/inspiration/dashboard-inspiration/"
    ]
  },

  "compliance": {
    "palette_preservation": "Primary #A62639 and Accent #E0AFA0 remain central",
    "no_universal_transition": true,
    "no_centered_app_container": true,
    "gradient_restriction_rule": true,
    "use_shadcn_only_for_primitives": true,
    "mobile_first": true
  },

  "general_guidelines": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n- You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n- NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n	- Prioritize using pre-existing components from src/components/ui when applicable\n	- Create new components that match the style and conventions of existing components when needed\n	- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n	- Use Shadcn/UI as the primary component library for consistency and accessibility\n	- Import path: ./components/[component-name]\n\n**Export Conventions:**\n	- Components MUST use named exports (export const ComponentName = ...)\n	- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
