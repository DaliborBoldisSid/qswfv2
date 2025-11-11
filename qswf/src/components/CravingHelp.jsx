import { useState, useEffect } from 'react'
import { ArrowLeft, Heart, RefreshCw, MessageCircle, ChevronDown, ChevronUp, Play } from 'lucide-react'
import quotesData from '../utils/quotes.json'
import { storage } from '../utils/storage'

const CravingHelp = ({ onBack }) => {
  const [currentQuote, setCurrentQuote] = useState('')
  const [responses, setResponses] = useState({})
  const [showQuestions, setShowQuestions] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [expandedTip, setExpandedTip] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    // Load saved responses
    const savedResponses = storage.getCravingResponses()
    setResponses(savedResponses)

    // Get a random quote
    getRandomQuote()
  }, [])

  // Categorize questions for better organization
  const questionCategories = [
    {
      name: "Getting Started",
      description: "Understanding your journey",
      icon: "🎯",
      questions: [0, 1, 2, 3, 4, 5, 10] // indices from questions_with_facts
    },
    {
      name: "Understanding Triggers",
      description: "Know what drives your cravings",
      icon: "🧠",
      questions: [6, 7, 11, 14, 21, 22, 34]
    },
    {
      name: "Progress & Milestones",
      description: "Track your achievements",
      icon: "📈",
      questions: [12, 13, 15, 16, 19, 32, 33, 38, 41, 42, 46]
    },
    {
      name: "Support & Motivation",
      description: "Build your support system",
      icon: "💪",
      questions: [5, 17, 18, 25, 26, 27, 28, 36, 37, 48, 50]
    },
    {
      name: "Health & Wellbeing",
      description: "Feel the improvements",
      icon: "❤️",
      questions: [13, 20, 29, 35, 39, 40, 44, 45, 47]
    },
    {
      name: "Planning Ahead",
      description: "Prepare for success",
      icon: "🗓️",
      questions: [8, 9, 23, 24, 31, 43, 49]
    }
  ]

  // Quick tips with expanded content
  const quickTips = [
    {
      icon: "💧",
      title: "Drink Water",
      shortDesc: "Hydration can reduce cravings significantly",
      fullDesc: "When a craving hits, drink a full glass of water slowly. This gives you something to do with your hands and mouth, while also flushing toxins from your system.",
      action: "Drink Now",
      color: "blue"
    },
    {
      icon: "🚶",
      title: "Take a Walk",
      shortDesc: "5 minutes of movement can distract your mind",
      fullDesc: "Physical activity releases endorphins, the same feel-good chemicals nicotine triggers. Even a short 5-minute walk can completely reset your craving cycle.",
      action: "Start Walking",
      color: "green"
    },
    {
      icon: "🧘",
      title: "Deep Breathing",
      shortDesc: "Breathe in for 4, hold for 4, out for 4",
      fullDesc: "The 4-4-4 breathing technique calms your nervous system and mimics the deep breathing you do when smoking, but without the harmful chemicals.",
      action: "Start Breathing",
      color: "purple"
    },
    {
      icon: "📱",
      title: "Call Someone",
      shortDesc: "Talk to a friend or family member",
      fullDesc: "Social connection triggers oxytocin, reducing stress and cravings. Even a quick text conversation can help you ride out the urge.",
      action: "Reach Out",
      color: "yellow"
    }
  ]

  const getRandomQuote = () => {
    const quotes = quotesData.motivational_quotes
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setCurrentQuote(quotes[randomIndex])
  }

  const handleResponseChange = (questionIndex, answer) => {
    const updatedResponses = {
      ...responses,
      [questionIndex]: answer
    }
    setResponses(updatedResponses)
    storage.saveCravingResponses(updatedResponses)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quotesData.questions_with_facts.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowQuestions(false)
      setCurrentQuestion(0)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-blue-500 to-purple-600 pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg p-4 text-white sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Craving Help</h1>
              <p className="text-sm text-white/80">Stay strong, you got this!</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Motivational Quote */}
        {!showQuestions && (
          <>
            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  You're Stronger Than Your Craving
                </h2>
              </div>
              
              <div className="bg-white p-6 rounded-xl mb-4">
                <p className="text-gray-800 text-lg italic text-center leading-relaxed">
                  "{currentQuote}"
                </p>
              </div>

              <button
                onClick={getRandomQuote}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Get Another Quote
              </button>
            </div>

            {/* Quick Tips - Now Expandable */}
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-3">Quick Tips to Beat Cravings</h3>
              <div className="space-y-2">
                {quickTips.map((tip, index) => (
                  <div key={index}>
                    <button
                      onClick={() => setExpandedTip(expandedTip === index ? null : index)}
                      className={`w-full bg-${tip.color}-50 p-3 rounded-lg text-left transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold text-${tip.color}-800`}>
                            {tip.icon} {tip.title}
                          </p>
                          <p className={`text-xs text-${tip.color}-700`}>{tip.shortDesc}</p>
                        </div>
                        {expandedTip === index ? (
                          <ChevronUp className={`w-5 h-5 text-${tip.color}-600 flex-shrink-0`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 text-${tip.color}-600 flex-shrink-0`} />
                        )}
                      </div>
                    </button>

                    {expandedTip === index && (
                      <div className={`mt-2 bg-${tip.color}-100 p-4 rounded-lg border-2 border-${tip.color}-200 animate-in slide-in-from-top`}>
                        <p className={`text-sm text-${tip.color}-800 mb-3`}>{tip.fullDesc}</p>
                        <button
                          onClick={() => {
                            // Action button - could trigger timer or other functionality
                            alert(`${tip.action}! Remember: This craving will pass in 5-10 minutes.`)
                          }}
                          className={`w-full py-2 px-4 bg-${tip.color}-500 hover:bg-${tip.color}-600 text-white rounded-lg font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2`}
                        >
                          <Play className="w-4 h-4" />
                          {tip.action}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reflection Questions Button */}
            <button
              onClick={() => setShowQuestions(true)}
              className="card hover:shadow-2xl transition-all active:scale-95 border-2 border-primary-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">Reflection Questions</h3>
                  <p className="text-sm text-gray-600">6 categories • Answer at your own pace</p>
                  <p className="text-xs text-primary-600 mt-1">✨ Optional & skip-friendly</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </button>
          </>
        )}

        {/* Questions Section - Category Selection or Question View */}
        {showQuestions && !selectedCategory && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Choose a Category</h3>
                <p className="text-sm text-gray-600 mt-1">Select a topic to explore</p>
              </div>
              <button
                onClick={() => setShowQuestions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-primary-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-primary-800">
                💡 Tip: These questions are completely optional. Skip any you want, or answer them all over time!
              </p>
            </div>

            <div className="space-y-3">
              {questionCategories.map((category, index) => {
                const answeredCount = category.questions.filter(q => responses[q]).length
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedCategory(index)
                      setCurrentQuestion(category.questions[0])
                    }}
                    className="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{category.icon}</span>
                          <h4 className="font-bold text-gray-800">{category.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${(answeredCount / category.questions.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {answeredCount}/{category.questions.length}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {showQuestions && selectedCategory !== null && (
          <div className="card">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  ← Back to Categories
                </button>
                <button
                  onClick={() => {
                    setShowQuestions(false)
                    setSelectedCategory(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{questionCategories[selectedCategory].icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{questionCategories[selectedCategory].name}</h3>
                  <p className="text-xs text-gray-600">
                    Question {questionCategories[selectedCategory].questions.indexOf(currentQuestion) + 1} of {questionCategories[selectedCategory].questions.length}
                  </p>
                </div>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all"
                  style={{
                    width: `${((questionCategories[selectedCategory].questions.indexOf(currentQuestion) + 1) / questionCategories[selectedCategory].questions.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800">
                {quotesData.questions_with_facts[currentQuestion].question}
              </h3>

              <textarea
                value={responses[currentQuestion] || ''}
                onChange={(e) => handleResponseChange(currentQuestion, e.target.value)}
                placeholder="Type your answer here... (optional)"
                className="input-field min-h-[120px] resize-none"
              />

              {quotesData.questions_with_facts[currentQuestion].fun_fact && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 mb-1">💡 Did you know?</p>
                  <p className="text-sm text-blue-700">
                    {quotesData.questions_with_facts[currentQuestion].fun_fact}
                  </p>
                </div>
              )}

              {quotesData.questions_with_facts[currentQuestion].explanation && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-purple-800 mb-1">ℹ️ Info</p>
                  <p className="text-sm text-purple-700">
                    {quotesData.questions_with_facts[currentQuestion].explanation}
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {questionCategories[selectedCategory].questions.indexOf(currentQuestion) > 0 && (
                  <button
                    onClick={() => {
                      const currentIndex = questionCategories[selectedCategory].questions.indexOf(currentQuestion)
                      setCurrentQuestion(questionCategories[selectedCategory].questions[currentIndex - 1])
                    }}
                    className="btn-secondary flex-1"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={() => {
                    const currentIndex = questionCategories[selectedCategory].questions.indexOf(currentQuestion)
                    if (currentIndex < questionCategories[selectedCategory].questions.length - 1) {
                      setCurrentQuestion(questionCategories[selectedCategory].questions[currentIndex + 1])
                    } else {
                      setSelectedCategory(null)
                    }
                  }}
                  className="btn-primary flex-1"
                >
                  {questionCategories[selectedCategory].questions.indexOf(currentQuestion) < questionCategories[selectedCategory].questions.length - 1 ? 'Next' : 'Done'}
                </button>
                <button
                  onClick={() => {
                    const currentIndex = questionCategories[selectedCategory].questions.indexOf(currentQuestion)
                    if (currentIndex < questionCategories[selectedCategory].questions.length - 1) {
                      setCurrentQuestion(questionCategories[selectedCategory].questions[currentIndex + 1])
                    } else {
                      setSelectedCategory(null)
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Help */}
        <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
          <h3 className="font-bold text-gray-800 mb-3">⚠️ Struggling?</h3>
          <p className="text-gray-700 mb-3">
            Remember: A craving typically lasts only 5-10 minutes. You can ride it out!
          </p>
          <div className="bg-white p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              If you're experiencing severe withdrawal symptoms, please consult a healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CravingHelp
