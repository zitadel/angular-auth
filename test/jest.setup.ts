/**
 * Jest setup that loads the Angular JIT compiler before any test module
 * imports Angular. Components in this library are partial-Ivy compiled; the
 * Angular Linker (run via babel over `@angular/*` in the Jest transform) emits
 * JIT-mode declarations, which require `@angular/compiler` to be present at
 * runtime. Importing it here registers the compiler facade globally.
 */
import '@angular/compiler';
