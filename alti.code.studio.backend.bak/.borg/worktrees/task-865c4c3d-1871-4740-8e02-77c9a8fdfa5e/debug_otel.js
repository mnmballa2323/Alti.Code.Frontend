
import * as resources from '@opentelemetry/resources';
console.log('Named Exports:', Object.keys(resources));
try {
    const def = resources.default;
    console.log('Default Export Type:', typeof def);
    if (def) console.log('Default Keys:', Object.keys(def));
    console.log('Has Resource in default?', !!def?.Resource);
} catch (e) {
    console.log('Error accessing default:', e.message);
}

