/**
 * Analysis Status Manager
 * Manages real-time status updates for ongoing analyses
 */

export interface AnalysisStatusUpdate {
  projectId: string;
  status: string;
  stage?: string;
  timestamp: number;
}

type StatusListener = (update: AnalysisStatusUpdate) => void;

class AnalysisStatusManager {
  private listeners: Map<string, Set<StatusListener>> = new Map();

  /**
   * Subscribe to status updates for a specific project
   */
  subscribe(projectId: string, listener: StatusListener): () => void {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set());
    }

    this.listeners.get(projectId)!.add(listener);

    // Return unsubscribe function
    return () => {
      const projectListeners = this.listeners.get(projectId);
      if (projectListeners) {
        projectListeners.delete(listener);
        if (projectListeners.size === 0) {
          this.listeners.delete(projectId);
        }
      }
    };
  }

  /**
   * Emit a status update for a project
   */
  emit(projectId: string, status: string, stage?: string): void {
    const update: AnalysisStatusUpdate = {
      projectId,
      status,
      stage,
      timestamp: Date.now(),
    };

    const projectListeners = this.listeners.get(projectId);
    if (projectListeners) {
      projectListeners.forEach((listener) => {
        try {
          listener(update);
        } catch (error) {
          console.error("[v0] Error in status listener:", error);
        }
      });
    }

    // Also log to console for debugging
    console.log(`[v0] ${status}`);
  }

  /**
   * Check if there are active listeners for a project
   */
  hasListeners(projectId: string): boolean {
    const listeners = this.listeners.get(projectId);
    return listeners ? listeners.size > 0 : false;
  }

  /**
   * Get the number of active listeners
   */
  getListenerCount(projectId?: string): number {
    if (projectId) {
      return this.listeners.get(projectId)?.size || 0;
    }

    let total = 0;
    this.listeners.forEach((listeners) => {
      total += listeners.size;
    });
    return total;
  }
}

// Singleton instance
export const analysisStatusManager = new AnalysisStatusManager();
