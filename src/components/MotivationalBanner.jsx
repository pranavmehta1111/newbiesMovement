import { useMemo } from 'react'

const MOTIVATIONAL_QUOTES = [
    { text: "The only bad workout is the one that didn't happen.", emoji: "💪" },
    { text: "Small steps every day lead to big results.", emoji: "🚶" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", emoji: "🧠" },
    { text: "Don't watch the clock; do what it does — keep going.", emoji: "⏰" },
    { text: "Success is the sum of small efforts repeated day in and day out.", emoji: "🔁" },
    { text: "You don't have to be extreme, just consistent.", emoji: "📈" },
    { text: "The distance between who you are and who you want to be is the effort you put in.", emoji: "🏃" },
    { text: "A little progress each day adds up to big results.", emoji: "🌱" },
    { text: "You are one workout away from a better mood.", emoji: "😊" },
    { text: "It always seems impossible until it's done.", emoji: "🏔️" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", emoji: "⚡" },
    { text: "Move your body, clear your mind.", emoji: "🧘" },
    { text: "Every step forward is a step toward achieving something bigger.", emoji: "👣" },
    { text: "Discipline is choosing between what you want now and what you want most.", emoji: "🎯" },
    { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", emoji: "🪞" },
    { text: "Don't limit your challenges. Challenge your limits.", emoji: "🚀" },
    { text: "Rest if you must, but don't you quit.", emoji: "💤" },
    { text: "Wake up with determination, go to bed with satisfaction.", emoji: "🌅" },
    { text: "You're stronger than you think.", emoji: "🦸" },
    { text: "The harder you work, the luckier you get.", emoji: "🍀" },
    { text: "Sweat is just fat crying.", emoji: "💧" },
    { text: "Believe in yourself and all that you are.", emoji: "✨" },
    { text: "One run can change your day. Many runs can change your life.", emoji: "🏅" },
    { text: "Today's effort is tomorrow's result.", emoji: "📊" },
    { text: "Champions keep playing until they get it right.", emoji: "🏆" },
    { text: "Motion creates emotion. Get moving!", emoji: "🎶" },
    { text: "Fall in love with taking care of yourself.", emoji: "❤️" },
    { text: "Your future self will thank you.", emoji: "🙏" },
    { text: "No one ever drowned in sweat.", emoji: "🌊" },
    { text: "Make yourself proud.", emoji: "⭐" },
    { text: "Strive for progress, not perfection.", emoji: "🎯" },
]

export default function MotivationalBanner() {
    const quote = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
        return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
    }, [])

    return (
        <div className="motivational-banner">
            <span className="text-2xl mr-3 flex-shrink-0">{quote.emoji}</span>
            <p className="text-sm font-medium italic">"{quote.text}"</p>
        </div>
    )
}
