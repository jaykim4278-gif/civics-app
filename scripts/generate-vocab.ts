
import { db } from "../server/db";
import { questions } from "../shared/schema";
import { eq } from "drizzle-orm";

// Pre-defined dictionary of key civic terms (Difficulty: Medium-High)
const CIVICS_DICTIONARY: Record<string, string> = {
    "Constitution": "헌법",
    "Supreme": "최고의",
    "Amendment": "수정조항",
    "Bill of Rights": "권리장전",
    "Declaration of Independence": "독립선언서",
    "Capitalism": "자본주의",
    "Market economy": "시장 경제",
    "Rule of law": "법의 지배",
    "Legislative": "입법부",
    "Executive": "행정부",
    "Judicial": "사법부",
    "Checks and balances": "견제와 균형",
    "Separation of powers": "권력 분립",
    "Congress": "의회",
    "Senate": "상원",
    "House of Representatives": "하원",
    "Senator": "상원의원",
    "Representative": "하원의원",
    "Term": "임기",
    "Population": "인구",
    "Democratic": "민주당의",
    "Republican": "공화당의",
    "Cabinet": "내각",
    "Secretary": "장관",
    "Agriculture": "농업",
    "Commerce": "상무",
    "Defense": "국방",
    "Education": "교육",
    "Energy": "에너지",
    "Health and Human Services": "보건복지",
    "Homeland Security": "국토안보",
    "Housing and Urban Development": "주택도시개발",
    "Interior": "내무",
    "Labor": "노동",
    "State": "국무/주",
    "Transportation": "교통",
    "Treasury": "재무",
    "Veterans Affairs": "보훈",
    "Attorney General": "법무장관",
    "Justices": "대법관",
    "Chief Justice": "대법원장",
    "Federal": "연방의",
    "Treaties": "조약",
    "Governor": "주지사",
    "Capital": "수도",
    "Speaker of the House": "하원의장",
    "Citizen": "시민",
    "Responsibility": "책임/의무",
    "Jury": "배심원단",
    "Election": "선거",
    "Allegiance": "충성",
    "Loyalty": "충성심",
    "Selective Service": "징병제",
    "Colonists": "식민지 개척자",
    "Freedom": "자유",
    "Liberty": "자유",
    "Persecution": "박해",
    "American Indians": "미국 원주민",
    "Slaves": "노예",
    "Slavery": "노예 제도",
    "Civil War": "남북전쟁",
    "Emancipation Proclamation": "노예 해방 선언",
    "Suffrage": "참정권",
    "Great Depression": "대공황",
    "Communism": "공산주의",
    "Civil rights": "민권/시민권",
    "Discrimination": "차별",
    "Terrorists": "테러리스트",
    "Geography": "지리",
    "Ocean": "대양",
    "Territory": "영토",
    "Border": "국경",
    "Statue of Liberty": "자유의 여신상",
    "Anthem": "국가(노래)",
    "Holidays": "공휴일",
    "Independence": "독립",
    "System": "체제",
    "Government": "정부",
    "Self-government": "자치",
    "Rights": "권리",
    "Economic": "경제의",
    "Branch": "부서/지점",
    "Veto": "거부권",
    "Inherit": "상속받다",
    "Tribe": "부족"
};

async function generateVocab() {
    console.log("Starting vocabulary generation...");

    const allQuestions = await db.select().from(questions);
    console.log(`Found ${allQuestions.length} questions to process.`);

    for (const q of allQuestions) {
        const combinedText = `${q.question} ${q.answer}`.toLowerCase();
        const vocab: { word: string; meaning: string }[] = [];

        // Simple keyword matching (prioritizing longer matches if overlaps existed, but here just simple iteration)
        // To ensure quality, we check for presence as a distinct word or prominent phrase
        for (const [english, korean] of Object.entries(CIVICS_DICTIONARY)) {
            if (vocab.length >= 3) break; // Limit to 3 words per card

            // Case-insensitive check
            if (combinedText.includes(english.toLowerCase())) {
                // Prevent duplicates
                if (!vocab.some(v => v.word === english)) {
                    vocab.push({ word: english, meaning: korean });
                }
            }
        }

        if (vocab.length > 0) {
            await db
                .update(questions)
                .set({ vocabulary: JSON.stringify(vocab) })
                .where(eq(questions.id, q.id));
            console.log(`Updated Q${q.id}: Found ${vocab.length} words`);
        } else {
            // Fallback or skip
            console.log(`Skipped Q${q.id}: No vocabulary match`);
        }
    }

    console.log("Vocabulary generation complete.");
}

generateVocab().catch(console.error);
