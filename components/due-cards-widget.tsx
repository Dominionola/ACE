import { getDueCardsCount } from "@/lib/actions/card";
import { Layers, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export async function DueCardsWidget() {
    const { total, byDeck } = await getDueCardsCount();

    if (total === 0) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-green-100 rounded-xl">
                        <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-serif text-lg text-green-800">All Caught Up!</h3>
                </div>
                <p className="text-sm text-green-700/70">
                    No cards due for review right now. Great job keeping up with your studies!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 rounded-xl">
                        <Layers className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg text-amber-900">Cards Due</h3>
                        <p className="text-xs text-amber-700/60">Ready for review</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-bold text-amber-600">{total}</span>
                    <p className="text-xs text-amber-700/60">cards</p>
                </div>
            </div>

            {/* Deck breakdown */}
            <div className="space-y-2 mb-4">
                {byDeck.slice(0, 3).map((deck) => (
                    <Link
                        key={deck.deckId}
                        href={`/dashboard/decks/${deck.deckId}/study`}
                        className="flex items-center justify-between p-3 bg-white/60 rounded-xl hover:bg-white transition-colors group"
                    >
                        <span className="text-sm text-amber-800 truncate max-w-[180px]">
                            {deck.deckTitle}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                {deck.count}
                            </span>
                            <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            {byDeck.length > 3 && (
                <p className="text-xs text-amber-700/60 text-center">
                    +{byDeck.length - 3} more deck{byDeck.length - 3 > 1 ? 's' : ''} with due cards
                </p>
            )}

            {/* Quick action */}
            {byDeck.length > 0 && (
                <Link
                    href={`/dashboard/decks/${byDeck[0].deckId}/study`}
                    className="mt-4 block w-full text-center py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-medium transition-colors"
                >
                    Start Review Session
                </Link>
            )}
        </div>
    );
}
