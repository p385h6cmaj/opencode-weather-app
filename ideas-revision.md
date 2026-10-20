# Revisión Weather CLI

- [x] **Colores:** implementados — cyan (menú), amarillo (temp), verde (éxito), rojo (error) en `src/lib/colors.js`.
- [] **AGENTS.md:** mantener actualizado este archivo cuando realizamos cambios en el proyecto.
- [] **Ciudades:** geocoding solo trae 1 resultado; nombres ambiguos pueden fallar.
- [] **Tests:** no existen; conviene al menos probar storage y las APIs con mocks.
- [] **Binario:** compila bien; revisar que `./weather` guarde datos en `~/.config/weather-cli/`.
- [] **Escalabilidad:** ¿qué tan fácil será expandir con nuevas funcionalidades?
- [] **Carga:** ¿hay estado de carga en las tareas asíncronas?
- [] **7 day forecast** agregar la posibilidad de obtener el pronóstico del clima para los próximos 7 días.