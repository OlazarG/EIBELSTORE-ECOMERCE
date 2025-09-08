class RetroBackground {
    constructor(options = {}) {
        this.options = {
            intensity: options.intensity || 'normal', // 'low', 'normal', 'high'
            ...options
        };
        
        this.canvas = null;
        this.ctx = null;
        this.waves = [];
        this.animationId = null;
        this.isActive = false;
        
        this.init();
    }

    init() {
        // Solo crear si no existe ya
        if (document.querySelector('.background-canvas')) {
            return;
        }

        // Agregar clase al body
        document.body.classList.add('retro-background');
        
        // Crear canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'background-canvas';
        this.ctx = this.canvas.getContext('2d');
        
        document.body.appendChild(this.canvas);
        this.resize();
        this.createWaves();
        
        // Event listeners
        window.addEventListener('resize', () => this.resize());
        
        this.start();
    }

    createWaves() {
        const intensitySettings = {
            low: { speed: 0.001, movement: 15, count: 2 },
            normal: { speed: 0.002, movement: 30, count: 3 },
            high: { speed: 0.003, movement: 50, count: 4 }
        };

        const settings = intensitySettings[this.options.intensity] || intensitySettings.normal;

        this.waves = [];
        
        for (let i = 0; i < settings.count; i++) {
            this.waves.push({
                baseX: this.canvas.width * (0.2 + i * 0.3),
                baseY: this.canvas.height * (0.3 + i * 0.2),
                x: this.canvas.width * (0.2 + i * 0.3),
                y: this.canvas.height * (0.3 + i * 0.2),
                radius: 300 - i * 50,
                baseRadius: 300 - i * 50,
                color: `rgba(${220 - i * 20}, ${53 - i * 10}, 69, ${0.3 - i * 0.05})`,
                speed: settings.speed * (1 + i * 0.2),
                direction: i % 2 === 0 ? 1 : -1,
                phase: (Math.PI * i) / settings.count,
                movement: settings.movement
            });
        }
    }

    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createWaves();
    }

    animate() {
        if (!this.isActive || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fondo base
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1f0202');
        gradient.addColorStop(0.25, '#2e2323');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(0.75, '#2e2323');
        gradient.addColorStop(1, '#1f0202');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const time = Date.now();
        
        // Animar ondas
        this.waves.forEach(wave => {
            wave.radius = wave.baseRadius + Math.sin(time * wave.speed + wave.phase) * wave.direction * wave.movement;
            wave.x = wave.baseX + Math.cos(time * wave.speed * 0.5 + wave.phase) * wave.movement;
            wave.y = wave.baseY + Math.sin(time * wave.speed * 0.3 + wave.phase) * (wave.movement * 0.8);
            
            const radialGradient = this.ctx.createRadialGradient(
                wave.x, wave.y, 0,
                wave.x, wave.y, wave.radius
            );
            radialGradient.addColorStop(0, wave.color);
            radialGradient.addColorStop(0.7, 'rgba(220, 53, 69, 0.05)');
            radialGradient.addColorStop(1, 'transparent');
            
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = radialGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'source-over';
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        this.isActive = true;
        this.animate();
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this.resize);
        document.body.classList.remove('retro-background');
    }

    setIntensity(intensity) {
        this.options.intensity = intensity;
        this.createWaves();
    }
}

// Singleton para usar globalmente
window.RetroBackground = RetroBackground;

// Auto-inicializar en páginas que tengan la clase 'auto-retro-bg'
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('auto-retro-bg')) {
        window.retroBg = new RetroBackground();
    }
});