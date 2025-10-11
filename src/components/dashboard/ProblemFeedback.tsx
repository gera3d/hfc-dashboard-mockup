"use client";

import { useState } from "react";
import { Review } from "@/data/dataService";
import { X, AlertTriangle, Star, User, Calendar, MessageSquare } from "lucide-react";
import Badge from "@/components/tailadmin/ui/badge/Badge";

interface ProblemFeedbackProps {
  reviews: Review[];
  onDismiss?: (reviewId: string) => void;
}

export default function ProblemFeedback({ reviews, onDismiss }: ProblemFeedbackProps) {
  const [dismissedReviews, setDismissedReviews] = useState<Set<string>>(new Set());

  // Filter for 1★, 2★, 3★ reviews with comments, excluding dismissed
  const problemReviews = reviews.filter(
    (review) => 
      review.rating <= 3 && 
      review.comment && 
      review.comment.trim().length > 0 &&
      !dismissedReviews.has(review.id)
  );

  const handleDismiss = (reviewId: string) => {
    setDismissedReviews((prev) => new Set(prev).add(reviewId));
    if (onDismiss) {
      onDismiss(reviewId);
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

  if (problemReviews.length === 0) {
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

  return (
    <div className="space-y-4">
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
        <Badge color="error">
          {problemReviews.length}
        </Badge>
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
                    className={`w-4 h-4 ${
                      star <= review.rating
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

            {/* Source Badge */}
            {review.source && (
              <div className="mt-2">
                <Badge color="secondary" className="text-xs">
                  {review.source}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
