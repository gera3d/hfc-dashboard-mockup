"use client";

import { useState, useEffect } from "react";
import { Review } from "@/data/dataService";
import { X, AlertTriangle, Star, User, Calendar, MessageSquare, ExternalLink, RotateCcw, Eye, EyeOff } from "lucide-react";
import Badge from "@/components/tailadmin/ui/badge/Badge";
import {
  getDismissedReviews,
  dismissReview,
  restoreReview,
  restoreAllReviews,
  subscribeToDismissedReviews
} from "@/lib/supabaseService";

interface ProblemFeedbackProps {
  reviews: Review[];
  onDismiss?: (reviewId: string) => void;
}

export default function ProblemFeedback({ reviews, onDismiss }: ProblemFeedbackProps) {
  const [dismissedReviews, setDismissedReviews] = useState<Set<string>>(new Set());
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDismissed, setShowDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load dismissed reviews from Supabase on mount
  useEffect(() => {
    const loadDismissedReviews = async () => {
      try {
        const dismissedIds = await getDismissedReviews();
        setDismissedReviews(new Set(dismissedIds));
      } catch (error) {
        console.error('Failed to load dismissed reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDismissedReviews();

    // Subscribe to real-time changes
    const unsubscribe = subscribeToDismissedReviews((reviewIds) => {
      setDismissedReviews(new Set(reviewIds));
    });

    return unsubscribe;
  }, []);

  // All problem reviews (1★, 2★, 3★ with comments)
  const allProblemReviews = reviews.filter(
    (review) =>
      review.rating <= 3 &&
      review.comment &&
      review.comment.trim().length > 0
  );

  // Active (non-dismissed) reviews
  const problemReviews = allProblemReviews.filter(
    (review) => !dismissedReviews.has(review.id)
  );

  // Dismissed reviews
  const clearedReviews = allProblemReviews.filter(
    (review) => dismissedReviews.has(review.id)
  );

  const handleDismiss = async (reviewId: string) => {
    // Optimistic update
    setDismissedReviews((prev) => new Set(prev).add(reviewId));

    // Persist to Supabase
    const success = await dismissReview(reviewId);
    if (!success) {
      // Revert on failure
      setDismissedReviews((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }

    if (onDismiss) {
      onDismiss(reviewId);
    }
  };

  const handleRestore = async (reviewId: string) => {
    // Optimistic update
    setDismissedReviews((prev) => {
      const newSet = new Set(prev);
      newSet.delete(reviewId);
      return newSet;
    });

    // Persist to Supabase
    const success = await restoreReview(reviewId);
    if (!success) {
      // Revert on failure
      setDismissedReviews((prev) => new Set(prev).add(reviewId));
    }
  };

  const handleRestoreAll = async () => {
    // Optimistic update
    const previousDismissed = new Set(dismissedReviews);
    setDismissedReviews(new Set());
    setShowDismissed(false);

    // Persist to Supabase
    const success = await restoreAllReviews();
    if (!success) {
      // Revert on failure
      setDismissedReviews(previousDismissed);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating === 1) return "text-red-600 dark:text-red-400";
    if (rating === 2) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  const getRatingBgColor = (rating: number) => {
    if (rating === 1) return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50";
    if (rating === 2) return "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/50";
    return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/50";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (problemReviews.length === 0 && clearedReviews.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full dark:bg-green-900/20">
            <Star className="w-8 h-8 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            No Problem Feedback
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Great job! There are no low-rated reviews with feedback in the current period.
          </p>
        </div>
      </div>
    );
  }

  // Show empty state with link to cleared reviews if all are dismissed
  if (problemReviews.length === 0 && clearedReviews.length > 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Centered header content */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full dark:bg-green-900/20">
            <Star className="w-8 h-8 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            All Caught Up!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            You've cleared all problem feedback for this period.
          </p>
          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0066cc] hover:text-[#0055aa] transition-colors"
          >
            {showDismissed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDismissed ? 'Hide' : 'Show'} {clearedReviews.length} cleared review{clearedReviews.length !== 1 ? 's' : ''}
          </button>
        </div>

        {/* Cleared Reviews Grid - Full width, not centered */}
        {showDismissed && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Cleared Reviews
              </span>
              <button
                onClick={handleRestoreAll}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#0066cc] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Restore All
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clearedReviews.map((review) => (
                <ClearedReviewCard
                  key={review.id}
                  review={review}
                  onRestore={handleRestore}
                  getRatingColor={getRatingColor}
                  getRatingBgColor={getRatingBgColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg dark:bg-red-900/20">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Problem Feedback
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {problemReviews.length} review{problemReviews.length !== 1 ? 's' : ''} need{problemReviews.length === 1 ? 's' : ''} attention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Show Cleared Link */}
          {clearedReviews.length > 0 && (
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#0066cc] transition-colors"
            >
              {showDismissed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showDismissed ? 'Hide' : 'Show'} {clearedReviews.length} cleared
            </button>
          )}
          <Badge color="error">
            {problemReviews.length}
          </Badge>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {problemReviews.map((review) => (
          <div
            key={review.id}
            className={`relative rounded-xl border p-4 transition-all hover:shadow-md ${getRatingBgColor(review.rating)}`}
          >
            {/* Dismiss Button */}
            <button
              onClick={() => handleDismiss(review.id)}
              className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 text-gray-400 transition-colors rounded-full hover:bg-white/50 hover:text-gray-600 dark:hover:bg-gray-800/50 dark:hover:text-gray-300"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating
                      ? `${getRatingColor(review.rating)} fill-current`
                      : 'text-gray-300 dark:text-gray-600'
                      }`}
                  />
                ))}
              </div>
              <span className={`text-sm font-semibold ${getRatingColor(review.rating)}`}>
                {review.rating}★
              </span>
            </div>

            {/* Comment Bubble */}
            <div className="relative mb-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-start gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
              {/* Chat bubble tail */}
              <div className={`absolute -bottom-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-gray-800`}></div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="font-medium">{review.agent_id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(review.review_ts)}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedReview(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Full Review</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Rating */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${star <= selectedReview.rating ? `${getRatingColor(selectedReview.rating)} fill-current` : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                  <span className={`text-lg font-bold ${getRatingColor(selectedReview.rating)}`}>
                    {selectedReview.rating} / 5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Feedback</label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {selectedReview.comment || 'No comment provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Agent</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {selectedReview.agent_id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedReview.review_ts)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</label>
                  <p className="text-gray-900 dark:text-white">{selectedReview.source}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cleared Reviews Section */}
      {showDismissed && clearedReviews.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Cleared Reviews ({clearedReviews.length})
            </span>
            <button
              onClick={handleRestoreAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#0066cc] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Restore All
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clearedReviews.map((review) => (
              <ClearedReviewCard
                key={review.id}
                review={review}
                onRestore={handleRestore}
                getRatingColor={getRatingColor}
                getRatingBgColor={getRatingBgColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// Cleared Review Card Component
interface ClearedReviewCardProps {
  review: Review;
  onRestore: (reviewId: string) => void;
  getRatingColor: (rating: number) => string;
  getRatingBgColor: (rating: number) => string;
  formatDate: (dateString: string) => string;
}

function ClearedReviewCard({ review, onRestore, getRatingColor, getRatingBgColor, formatDate }: ClearedReviewCardProps) {
  return (
    <div
      className={`relative rounded-xl border p-4 transition-all opacity-60 hover:opacity-100 ${getRatingBgColor(review.rating)}`}
    >
      {/* Restore Button */}
      <button
        onClick={() => onRestore(review.id)}
        className="absolute top-3 right-3 flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-[#0066cc] bg-white/80 rounded-md transition-colors hover:bg-white hover:shadow-sm"
        title="Restore"
      >
        <RotateCcw className="w-3 h-3" />
        Restore
      </button>

      {/* Rating Stars */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${star <= review.rating
                ? `${getRatingColor(review.rating)} fill-current`
                : 'text-gray-300 dark:text-gray-600'
                }`}
            />
          ))}
        </div>
        <span className={`text-sm font-semibold ${getRatingColor(review.rating)}`}>
          {review.rating}★
        </span>
      </div>

      {/* Comment Bubble */}
      <div className="relative mb-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
              {review.comment}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span className="font-medium">{review.agent_id}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(review.review_ts)}</span>
        </div>
      </div>
    </div>
  );
}
