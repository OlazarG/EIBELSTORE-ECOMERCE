const products = [
    // ANILLOS (Rings)
    {
        id: 1,
        title: "Anillo Solitario Oro 18k",
        category: "anillos",
        price: 1299.00,
        image: "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
        images: [
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg",
            "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg"
        ],
        badge: "NUEVO",
        description: "Exquisito anillo solitario en oro de 18 kilates con diamante corte esmeralda. La elegancia atemporal para momentos inolvidables."
    },
    {
        id: 2,
        title: "Anillo Royal Diamond",
        category: "anillos",
        price: 899.00,
        image: "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg",
        images: [
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg",
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
            "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg"
        ],
        badge: "DESTACADO",
        description: "Diseño real con detalles intrincados y baño de oro puro."
    },
    {
        id: 3,
        title: "Alianza Eterna",
        category: "anillos",
        price: 450.00,
        image: "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
        images: [
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
            "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg"
        ],
        badge: "",
        description: "Símbolo de amor eterno, forjado en oro amarillo brillante."
    },

    // COLLARES (Necklaces)
    {
        id: 4,
        title: "Collar Diamantes Cascade",
        category: "collares",
        price: 3500.00,
        image: "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg",
        images: [
            "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg",
            "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg",
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg"
        ],
        badge: "LUJO",
        description: "Una cascada de diamantes certificados que iluminan cualquier estancia."
    },
    {
        id: 5,
        title: "Gargantilla Imperial",
        category: "collares",
        price: 1800.00,
        image: "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg",
        images: [
            "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg",
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg"
        ],
        badge: "OFERTA",
        description: "Diseño imperial para la realeza moderna. Acabado en platino."
    },

    // COLGANTES (Pendants)
    {
        id: 6,
        title: "Colgante Corona Real",
        category: "colgantes",
        price: 599.00,
        image: "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg",
        images: [
            "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg",
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
            "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg"
        ],
        badge: "EXCLUSIVO",
        description: "Un colgante en forma de corona con incrustaciones de rubíes y esmeraldas."
    },
    {
        id: 7,
        title: "Medalla Real Gold",
        category: "colgantes",
        price: 320.00,
        image: "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg",
        images: [
            "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg",
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg"
        ],
        badge: "",
        description: "Medalla conmemorativa en oro macizo."
    },

    // RELOJES (Watches)
    {
        id: 8,
        title: "Reloj Philippe Gold",
        category: "relojes",
        price: 15000.00,
        image: "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg", // Reusing image as placeholder if no watch image
        images: [
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5 (1).jpeg",
            "image/bde6f323-dd11-468f-ac11-82cd4ae4a488.jpeg"
        ],
        badge: "PREMIUM",
        description: "Maquinaria suiza de precisión encuadrada en una caja de oro rosa."
    },
    {
        id: 9,
        title: "Chronograph Noir",
        category: "relojes",
        price: 8500.00,
        image: "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg", // Reusing image
        images: [
            "image/156c3183-d57e-4321-9a7d-4e5263f5e4c5.jpeg",
            "image/db13b532-77c8-4cdf-b828-e1d1e9a8138a.jpeg"
        ],
        badge: "NUEVO",
        description: "Elegancia deportiva con correa de piel genuina y esfera de zafiro."
    }
];

window.products = products;
