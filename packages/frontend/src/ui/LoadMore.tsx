import { useEffect, useRef } from "react";
import styles from "./styles/load-more.module.css";
import { Spinner } from "./Spinner";

interface LoadMoreProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  error?: Error | null;
  mode?: "scroll" | "button";
  noMoreText?: string;
  loadText?: string;
  errorText?: string;
  threshold?: number;
  rootMargin?: string;
}

function LoadMore({
  onLoadMore,
  hasMore,
  isLoadingMore,
  error = null,
  mode = "scroll",
  noMoreText = "No more items",
  loadText = "Load more",
  errorText = "Couldn't load more. Retry",
  threshold = 0.1,
  rootMargin = "200px",
}: LoadMoreProps) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (mode !== "scroll" || !hasMore || error) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mode, hasMore, isLoadingMore, error, onLoadMore, threshold, rootMargin]);

  if (error) {
    return (
      <div className={styles.wrapper}>
        <button className={styles.retryButton} onClick={onLoadMore}>
          {errorText}
        </button>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.endText}>{noMoreText}</p>
      </div>
    );
  }

  if (mode === "button") {
    return (
      <div className={styles.wrapper}>
        <button
          className={styles.loadButton}
          onClick={onLoadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? <Spinner size="1.4rem" inline /> : loadText}
        </button>
      </div>
    );
  }

  // scroll mode
  return (
    <div ref={sentinelRef} className={styles.sentinel}>
      {isLoadingMore && <Spinner size="2rem" inline />}
    </div>
  );
}

export default LoadMore;
