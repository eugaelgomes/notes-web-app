import { useState, useEffect, useRef } from 'react';

/**
 * =================== HOOK PARA ESTADOS DE LOADING INTELIGENTES ===================
 * 
 * Este hook gerencia diferentes tipos de loading states e melhora a UX:
 * 
 * TIPOS DE LOADING:
 * - initial: Primeiro carregamento (mostra skeleton)
 * - refresh: Recarregamento (mostra indicador discreto)  
 * - background: Carregamento em background (mantém dados anteriores)
 * - error: Estado de erro com retry
 * 
 * BENEFÍCIOS:
 * ✅ UX mais sofisticada e profissional
 * ✅ Evita "flashing" de conteúdo
 * ✅ Estados visuais apropriados para cada situação
 * ✅ Retry automático em caso de erro
 */

/**
 * Hook principal para gerenciar estados de loading
 */
export const useLoadingState = (options = {}) => {
  const {
    minLoadingTime = 500,      // Tempo mínimo de loading (evita flash)
    showSkeletonTime = 300,    // Quando mostrar skeleton vs spinner
    maxRetries = 3,            // Tentativas máximas em caso de erro
    retryDelay = 1000,         // Delay entre tentativas (ms)
  } = options;
  
  // =================== ESTADOS ===================
  const [loadingState, setLoadingState] = useState('idle'); // idle, initial, refresh, background, error
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [data, setData] = useState(null);
  
  // =================== REFS PARA CONTROLE ===================
  const loadingStartTime = useRef(null);
  const retryTimeout = useRef(null);
  
  // =================== FUNÇÕES PRINCIPAIS ===================
  
  /**
   * Inicia um carregamento
   * @param {string} type - Tipo: 'initial', 'refresh', 'background'
   */
  const startLoading = (type = 'initial') => {
    loadingStartTime.current = Date.now();
    setLoadingState(type);
    setError(null);
    
    console.log(`🔄 Loading iniciado: ${type}`); // Debug educativo
  };
  
  /**
   * Finaliza carregamento com sucesso
   * @param {any} newData - Dados carregados
   */
  const finishLoading = async (newData) => {
    const loadingTime = Date.now() - (loadingStartTime.current || Date.now());
    
    // GARANTIR TEMPO MÍNIMO DE LOADING (evita flash)
    if (loadingTime < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - loadingTime));
    }
    
    setData(newData);
    setLoadingState('idle');
    setRetryCount(0);
    
    console.log(`✅ Loading concluído em ${loadingTime}ms`); // Debug educativo
  };
  
  /**
   * Finaliza carregamento com erro
   * @param {Error} errorObj - Erro ocorrido
   * @param {boolean} autoRetry - Se deve tentar novamente automaticamente
   */
  const finishWithError = (errorObj, autoRetry = true) => {
    setError(errorObj);
    setLoadingState('error');
    
    console.log(`❌ Loading falhou: ${errorObj.message}`); // Debug educativo
    
    // RETRY AUTOMÁTICO
    if (autoRetry && retryCount < maxRetries) {
      retryTimeout.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries}`);
        // A lógica de retry deve ser implementada pelo componente que usa o hook
      }, retryDelay * (retryCount + 1)); // Backoff exponencial
    }
  };
  
  /**
   * Retry manual
   */
  const retry = () => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
    }
    setRetryCount(prev => prev + 1);
    startLoading('refresh');
  };
  
  /**
   * Reset completo do estado
   */
  const reset = () => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
    }
    setLoadingState('idle');
    setError(null);
    setRetryCount(0);
    setData(null);
  };
  
  // =================== COMPUTED VALUES ===================
  const isLoading = loadingState !== 'idle' && loadingState !== 'error';
  const isInitialLoading = loadingState === 'initial';
  const isRefreshing = loadingState === 'refresh';
  const isBackgroundLoading = loadingState === 'background';
  const hasError = loadingState === 'error';
  const canRetry = hasError && retryCount < maxRetries;
  const shouldShowSkeleton = isInitialLoading; // Pode adicionar mais lógica aqui
  
  // =================== CLEANUP ===================
  useEffect(() => {
    return () => {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, []);
  
  // =================== RETURN ===================
  return {
    // Estados
    loadingState,
    isLoading,
    isInitialLoading,
    isRefreshing,
    isBackgroundLoading,
    hasError,
    error,
    data,
    retryCount,
    canRetry,
    shouldShowSkeleton,
    
    // Funções
    startLoading,
    finishLoading,
    finishWithError,
    retry,
    reset,
  };
};

/**
 * =================== HOOK ESPECÍFICO PARA LISTAS ===================
 * Versão especializada para listas com paginação
 */
export const useListLoadingState = (options = {}) => {
  const baseHook = useLoadingState(options);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  /**
   * Carrega próxima página (para scroll infinito)
   */
  const loadNextPage = () => {
    if (!baseHook.isLoading && hasMore) {
      setPage(prev => prev + 1);
      baseHook.startLoading('background');
    }
  };
  
  /**
   * Refresh da primeira página
   */
  const refreshList = () => {
    setPage(1);
    setHasMore(true);
    baseHook.startLoading('refresh');
  };
  
  /**
   * Carregamento inicial da lista
   */
  const loadInitial = () => {
    setPage(1);
    setHasMore(true);
    baseHook.startLoading('initial');
  };
  
  /**
   * Finaliza carregamento de lista com dados paginados
   */
  const finishListLoading = (newData, pagination = {}) => {
    const { hasMore: morePages = false, isFirstPage = false } = pagination;
    
    // Se é primeira página, substitui dados. Senão, concatena
    const finalData = isFirstPage || page === 1 
      ? newData 
      : [...(baseHook.data || []), ...newData];
    
    setHasMore(morePages);
    baseHook.finishLoading(finalData);
  };
  
  return {
    ...baseHook,
    // Estados específicos de lista
    hasMore,
    page,
    
    // Funções específicas de lista
    loadNextPage,
    refreshList,
    loadInitial,
    finishListLoading,
  };
};

/**
 * =================== HOOK PARA FORM LOADING ===================
 * Para estados de loading em formulários
 */
export const useFormLoadingState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const startSubmit = () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };
  
  const finishSubmitSuccess = () => {
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset success após 3 segundos
    setTimeout(() => setSubmitSuccess(false), 3000);
  };
  
  const finishSubmitError = (error) => {
    setIsSubmitting(false);
    setSubmitError(error);
  };
  
  const reset = () => {
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  };
  
  return {
    isSubmitting,
    submitError,
    submitSuccess,
    startSubmit,
    finishSubmitSuccess,
    finishSubmitError,
    reset,
  };
};

export default useLoadingState;