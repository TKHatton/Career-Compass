export default function ScriptureTile() {
  // In production, this would fetch from a curated list of verses
  // For now, we use a static verse
  const verse = {
    text: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    reference: 'Proverbs 3:5',
    devotional:
      'When facing difficult decisions, remember that clarity often comes through steady reflection rather than rushed answers. Take time to consider what matters most.',
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-elevated border-2 border-mist-teal">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-mist-teal flex items-center justify-center text-xl flex-shrink-0 shadow-soft">
          ✨
        </div>
        <div className="flex-1">
          <p className="text-base text-black leading-relaxed mb-2 font-medium">
            &ldquo;{verse.text}&rdquo;
          </p>
          <p className="text-sm text-sage-gray font-semibold">{verse.reference}</p>
        </div>
      </div>

      <div className="bg-sand-rose rounded-2xl p-4">
        <p className="text-sm text-black leading-relaxed">{verse.devotional}</p>
      </div>
    </div>
  )
}
