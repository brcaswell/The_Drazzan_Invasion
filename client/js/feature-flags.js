// Feature Flags Configuration - Controls availability of game features
class FeatureFlags {
    constructor() {
        this.flags = {
            // Game modes
            SINGLE_PLAYER: {
                enabled: true,
                description: 'Classic single player experience'
            },
            COOPERATIVE_MODE: {
                enabled: true,
                description: 'Team up with friends against AI enemies'
            },
            VERSUS_MODE: {
                enabled: true,
                description: 'Compete against other players'
            },

            // Features within game modes
            BOSS_BATTLES: {
                enabled: true,
                description: 'Epic boss fight sequences'
            },
            POWER_UPS: {
                enabled: true,
                description: 'Collectible power-ups and upgrades'
            },
            LEADERBOARDS: {
                enabled: true,
                description: 'Global and local high scores'
            },

            // Advanced features
            SPECTATOR_MODE: {
                enabled: false,
                description: 'Watch other players in multiplayer games',
                comingSoon: true
            },
            CUSTOM_SHIPS: {
                enabled: false,
                description: 'Customize your ship appearance',
                comingSoon: true
            },
            ACHIEVEMENTS: {
                enabled: false,
                description: 'Unlock achievements and badges',
                comingSoon: true
            },

            // Technical features
            DEBUG_CONSOLE: {
                enabled: true,
                description: 'Developer debug console (~ key) - Single player mode only',
                developmentOnly: true,
                singlePlayerOnly: true
            },
            WEBRTC_NETWORKING: {
                enabled: true,
                description: 'Peer-to-peer multiplayer networking'
            },
            WASM_SERVERS: {
                enabled: true,
                description: 'WebAssembly-based game servers'
            }
        };

        // Environment-specific overrides
        this.applyEnvironmentOverrides();
    }

    // Check if a feature is enabled
    isEnabled(flagName) {
        const flag = this.flags[flagName];
        if (!flag) {
            console.warn(`[FeatureFlags] Unknown feature flag: ${flagName}`);
            return false;
        }

        // Check environment restrictions
        if (flag.developmentOnly && !this.isDevelopment()) {
            return false;
        }

        return flag.enabled === true;
    }

    // Get feature information
    getFeature(flagName) {
        return this.flags[flagName] || null;
    }

    // Get all enabled features
    getEnabledFeatures() {
        return Object.keys(this.flags).filter(key => this.isEnabled(key));
    }

    // Get all coming soon features
    getComingSoonFeatures() {
        return Object.keys(this.flags).filter(key => {
            const flag = this.flags[key];
            return flag && flag.comingSoon === true;
        });
    }

    // Check if running in development environment
    isDevelopment() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:' ||
            window.location.search.includes('debug=true');
    }

    // Apply environment-specific overrides
    applyEnvironmentOverrides() {
        // Enable debug features in development
        if (this.isDevelopment()) {
            // Could enable additional debug features here
            console.log('[FeatureFlags] Development environment detected - debug features enabled');
        }

        // Check for URL parameter overrides
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams.entries()) {
            if (key.startsWith('feature_') && this.flags[key.substring(8)?.toUpperCase()]) {
                const flagName = key.substring(8).toUpperCase();
                this.flags[flagName].enabled = value === 'true' || value === '1';
                console.log(`[FeatureFlags] URL override: ${flagName} = ${this.flags[flagName].enabled}`);
            }
        }
    }

    // Toggle a feature (for development/testing)
    toggle(flagName) {
        if (this.flags[flagName] && this.isDevelopment()) {
            this.flags[flagName].enabled = !this.flags[flagName].enabled;
            console.log(`[FeatureFlags] Toggled ${flagName}: ${this.flags[flagName].enabled}`);
            return this.flags[flagName].enabled;
        }
        return false;
    }

    // Set feature state (for development/testing)
    setEnabled(flagName, enabled) {
        if (this.flags[flagName] && this.isDevelopment()) {
            this.flags[flagName].enabled = enabled;
            console.log(`[FeatureFlags] Set ${flagName}: ${enabled}`);
            return true;
        }
        return false;
    }

    // Get feature status for UI display
    getFeatureStatus(flagName) {
        const flag = this.flags[flagName];
        if (!flag) return { status: 'unknown', message: 'Feature not found' };

        if (flag.enabled) {
            return { status: 'enabled', message: 'Available' };
        } else if (flag.comingSoon) {
            const message = flag.estimatedDate ?
                `Coming Soon (${flag.estimatedDate})` :
                'Coming Soon';
            return { status: 'coming-soon', message };
        } else {
            return { status: 'disabled', message: 'Not Available' };
        }
    }

    // Log all feature states (for debugging)
    logStatus() {
        console.group('[FeatureFlags] Current Feature Status');
        Object.keys(this.flags).forEach(key => {
            const flag = this.flags[key];
            const status = this.getFeatureStatus(key);
            console.log(`${key}: ${status.message} (${flag.description})`);
        });
        console.groupEnd();
    }
}

// Create global instance
window.featureFlags = new FeatureFlags();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureFlags;
}

// Log initial status in development
if (window.featureFlags.isDevelopment()) {
    console.log('[FeatureFlags] Feature flags initialized');
    // Uncomment to see all flags on startup:
    // window.featureFlags.logStatus();
}