import { useState, useEffect } from 'react';

/**
 * =================== HOOK DE DEBOUNCE ===================
 * 
 * Este hook atrasa a atualização de um valor até que o usuário
 * pare de digitar por um tempo determinado.
 * 
 * PROBLEMA QUE RESOLVE:
 * - Sem debounce: usuário digita "react" = 5 requisições (r, re, rea, reac, react)
 * - Com debounce: usuário digita "react" = 1 requisição (react) após 300ms
 * 
 * COMO USAR:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * // debouncedSearch só atualiza 300ms após usuário parar de digitar
 * 
 * @param {any} value - Valor a ser "atrasado"
 * @param {number} delay - Tempo em milissegundos para esperar
 * @returns {any} - Valor atrasado
 */
export const useDebounce = (value, delay = 300) => {
  // Estado interno para guardar o valor atrasado
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Cria um timer para atualizar o valor após o delay
    const timer = setTimeout(() => {
      console.log(`⏱️ Debounce: Atualizando "${value}" após ${delay}ms`); // Debug educativo
      setDebouncedValue(value);
    }, delay);

    // CLEANUP: Se o valor mudar antes do timer acabar, cancela o timer anterior
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Reexecuta quando value ou delay mudarem

  return debouncedValue;
};

export default useDebounce;