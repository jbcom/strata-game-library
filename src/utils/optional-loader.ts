/**
 * Optional Package Loader
 *
 * Provides transparent folding mechanism for optional Strata packages.
 * When @strata/shaders or @strata/presets are installed, their exports
 * are automatically merged into the core package exports.
 *
 * @module utils/optional-loader
 */

/**
 * Registry of optional packages and their status
 */
export interface OptionalPackageStatus {
    name: string;
    available: boolean;
    version?: string;
}

/** Cache for loaded optional packages */
const packageCache = new Map<string, unknown>();

/** Cache for availability checks */
const availabilityCache = new Map<string, boolean>();

/**
 * Attempts to load an optional package dynamically.
 * Returns null if the package is not installed.
 *
 * @param packageName - The npm package name to load
 * @returns Promise resolving to the package exports or null if not available
 *
 * @example
 * ```typescript
 * const shaders = await loadOptionalPackage<typeof import('@strata/shaders')>('@strata/shaders');
 * if (shaders) {
 *   // Use shaders
 * }
 * ```
 */
export async function loadOptionalPackage<T>(packageName: string): Promise<T | null> {
    // Check cache first
    if (packageCache.has(packageName)) {
        return packageCache.get(packageName) as T;
    }

    try {
        const pkg = await import(/* webpackIgnore: true */ packageName);
        packageCache.set(packageName, pkg);
        availabilityCache.set(packageName, true);
        return pkg as T;
    } catch {
        // Package not installed - this is expected and not an error
        availabilityCache.set(packageName, false);
        return null;
    }
}

/**
 * Synchronously checks if an optional package was previously loaded.
 * Note: This only returns accurate results after loadOptionalPackage has been called.
 *
 * @param packageName - The npm package name to check
 * @returns true if the package was successfully loaded
 */
export function isOptionalPackageAvailable(packageName: string): boolean {
    return availabilityCache.get(packageName) ?? false;
}

/**
 * Probes for an optional package availability.
 * This attempts to load the package and caches the result.
 *
 * @param packageName - The npm package name to probe
 * @returns Promise resolving to true if the package is available
 */
export async function probeOptionalPackage(packageName: string): Promise<boolean> {
    const cached = availabilityCache.get(packageName);
    if (cached !== undefined) {
        return cached;
    }

    const pkg = await loadOptionalPackage(packageName);
    return pkg !== null;
}

/**
 * Get status of all optional Strata packages
 */
export async function getOptionalPackagesStatus(): Promise<OptionalPackageStatus[]> {
    const packages = ['@strata/shaders', '@strata/presets'];

    const results = await Promise.all(
        packages.map(async (name) => {
            const available = await probeOptionalPackage(name);
            return { name, available, version: undefined };
        })
    );

    return results;
}

/**
 * Merges optional package exports into a target object.
 * Used internally to implement transparent folding.
 *
 * @param target - The object to merge exports into
 * @param packageName - The optional package to load and merge
 * @returns Promise resolving to the merged object
 */
export async function mergeOptionalExports<T extends object>(
    target: T,
    packageName: string
): Promise<T> {
    const pkg = await loadOptionalPackage<Record<string, unknown>>(packageName);

    if (pkg) {
        Object.assign(target, pkg);
    }

    return target;
}

/**
 * Clears the optional package cache.
 * Useful for testing or when packages may be dynamically installed.
 */
export function clearOptionalPackageCache(): void {
    packageCache.clear();
    availabilityCache.clear();
}
