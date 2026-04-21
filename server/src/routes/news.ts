import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthPayload } from '../auth';

const router = Router();
router.use(requireAuth);

// Curated mock news articles per category — in production swap for a real news API
const MOCK_NEWS: Record<string, Array<{ title: string; description: string; url: string; source: string; published_at: string }>> = {
  technology: [
    { title: 'New AI Model Can Write Code Faster Than Humans', description: 'Researchers at a top university have developed an AI that writes programs 10x faster.', url: '#', source: 'TechDaily', published_at: new Date().toISOString() },
    { title: 'Students Build App to Track School Bus Locations', description: 'A group of high school students developed a real-time bus tracking app for their district.', url: '#', source: 'EduTech', published_at: new Date().toISOString() },
    { title: 'How Quantum Computers Will Change Encryption', description: 'Scientists explain the upcoming challenge that quantum computers pose to data security.', url: '#', source: 'ScienceNow', published_at: new Date().toISOString() },
  ],
  science: [
    { title: 'Scientists Discover New Species in Deep Ocean', description: 'Explorers found 12 new species during a deep sea expedition off the Pacific coast.', url: '#', source: 'NatureWeekly', published_at: new Date().toISOString() },
    { title: 'Students Win Regional Science Fair with Solar Drone', description: 'Three middle schoolers took home the top prize for their solar-powered weather drone.', url: '#', source: 'ScienceKids', published_at: new Date().toISOString() },
    { title: 'Why Your Brain Learns Better After Sleep', description: 'New research shows that sleep consolidates memory far more effectively than extra study time.', url: '#', source: 'BrainHealth', published_at: new Date().toISOString() },
  ],
  sports: [
    { title: 'Local School Team Wins National Championship', description: 'Jefferson High basketball team clinched their first national title with a dramatic final.', url: '#', source: 'SportsBuzz', published_at: new Date().toISOString() },
    { title: 'How to Improve Your Athletic Performance with Smart Training', description: 'Top coaches share science-backed tips for young athletes to train smarter, not harder.', url: '#', source: 'AthletePro', published_at: new Date().toISOString() },
    { title: 'Olympics Introduces New Youth Sports Events', description: 'The IOC announced three new youth-focused events for the next summer Olympics.', url: '#', source: 'OlympicsNow', published_at: new Date().toISOString() },
  ],
  arts: [
    { title: 'Student Murals Transform School Hallways', description: 'Art students painted stunning murals across their school, turning blank walls into masterpieces.', url: '#', source: 'ArtsEdu', published_at: new Date().toISOString() },
    { title: 'Photography Tips for Beginners: Capture Your World', description: 'Simple techniques to take stunning photos with just your smartphone.', url: '#', source: 'PhotoLife', published_at: new Date().toISOString() },
    { title: 'How Street Art Became a Global Movement', description: 'From Banksy to local muralists, street art is reshaping how we see public spaces.', url: '#', source: 'ArtWorld', published_at: new Date().toISOString() },
  ],
  music: [
    { title: 'School Choir Performs at Carnegie Hall', description: 'A 60-member student choir earned a standing ovation at one of the world\'s most prestigious venues.', url: '#', source: 'MusicNews', published_at: new Date().toISOString() },
    { title: 'How Learning an Instrument Boosts Your Grades', description: 'Studies show students who play music score significantly higher in math and reading.', url: '#', source: 'EduInsight', published_at: new Date().toISOString() },
    { title: 'Top 10 Songs for Studying and Focus', description: 'Curated playlist recommendations to keep you in the zone during homework sessions.', url: '#', source: 'StudyBeats', published_at: new Date().toISOString() },
  ],
  gaming: [
    { title: 'School Esports League Expands to 500 Schools', description: 'The national high school esports league now includes 500 schools across all 50 states.', url: '#', source: 'EsportsNow', published_at: new Date().toISOString() },
    { title: 'Game Developer Opens Internships for High School Students', description: 'Indie studio offering summer internships to teens passionate about game design.', url: '#', source: 'GameDev', published_at: new Date().toISOString() },
    { title: 'How Video Games Are Being Used in Classrooms', description: 'Teachers share how educational gaming improves engagement and learning outcomes.', url: '#', source: 'EduGaming', published_at: new Date().toISOString() },
  ],
  environment: [
    { title: 'Students Plant 10,000 Trees in Weekend Campaign', description: 'Youth volunteers from 30 schools joined forces to reforest a local hillside.', url: '#', source: 'GreenEarth', published_at: new Date().toISOString() },
    { title: 'How Schools Are Going Zero Waste', description: 'Innovative schools share their strategies for eliminating landfill waste entirely.', url: '#', source: 'EcoSchools', published_at: new Date().toISOString() },
    { title: 'New Solar Panels Power Entire School District', description: 'A district in California now runs entirely on renewable energy after major solar installation.', url: '#', source: 'CleanEnergy', published_at: new Date().toISOString() },
  ],
  history: [
    { title: 'Archaeologists Uncover Ancient City Beneath Modern Town', description: 'Excavations reveal a 3,000-year-old settlement under a small Italian village.', url: '#', source: 'HistoryDigest', published_at: new Date().toISOString() },
    { title: 'Lost Letter from Civil War Soldier Found in Attic', description: 'A family discovers a cache of letters revealing detailed accounts of battlefield life.', url: '#', source: 'HeritageNews', published_at: new Date().toISOString() },
    { title: 'How Ancient Civilizations Solved Modern Problems', description: 'From water management to urban planning, ancient solutions still inspire today.', url: '#', source: 'AncientWisdom', published_at: new Date().toISOString() },
  ],
  math: [
    { title: 'Teen Solves 50-Year-Old Math Problem', description: 'A 17-year-old from Ohio cracked a problem that stumped professional mathematicians.', url: '#', source: 'MathWorld', published_at: new Date().toISOString() },
    { title: 'How to Make Math Fun: Tips from Top Teachers', description: 'Creative classroom strategies that turn math anxiety into genuine curiosity.', url: '#', source: 'EduMath', published_at: new Date().toISOString() },
    { title: 'The Beautiful Math Hidden in Nature', description: 'From sunflowers to galaxies, discover the Fibonacci sequence and fractals all around you.', url: '#', source: 'MathNature', published_at: new Date().toISOString() },
  ],
  space: [
    { title: 'NASA Discovers Water Ice on Moon\'s South Pole', description: 'New findings confirm accessible ice deposits that could support future lunar bases.', url: '#', source: 'SpaceNow', published_at: new Date().toISOString() },
    { title: 'Student-Built Satellite Launches Successfully', description: 'High school team\'s CubeSat project successfully reached orbit after 2 years of work.', url: '#', source: 'AstroKids', published_at: new Date().toISOString() },
    { title: 'James Webb Telescope Captures Deepest Image of Universe', description: 'New images reveal galaxies formed just 300 million years after the Big Bang.', url: '#', source: 'AstronomyNow', published_at: new Date().toISOString() },
  ],
  animals: [
    { title: 'Rare Snow Leopard Cubs Born at City Zoo', description: 'Three healthy cubs were born to a mother snow leopard as part of a conservation program.', url: '#', source: 'WildLife', published_at: new Date().toISOString() },
    { title: 'Dogs Can Detect Illness with 97% Accuracy', description: 'New research confirms trained dogs can sniff out cancer and diabetes more accurately than lab tests.', url: '#', source: 'AnimalScience', published_at: new Date().toISOString() },
    { title: 'How Migrating Birds Navigate Using Earth\'s Magnetic Field', description: 'Scientists finally uncover the molecular mechanism behind birds\' incredible navigation ability.', url: '#', source: 'BirdWatch', published_at: new Date().toISOString() },
  ],
  health: [
    { title: '10 Healthy Snacks That Boost Brain Power', description: 'Nutritionists share the best foods to eat before studying or taking a big exam.', url: '#', source: 'HealthKids', published_at: new Date().toISOString() },
    { title: 'Why Teens Need More Sleep Than Adults', description: 'New research reaffirms that teenagers need 8–10 hours for healthy brain development.', url: '#', source: 'TeenHealth', published_at: new Date().toISOString() },
    { title: 'Simple Daily Exercise Routine for Students', description: 'A 15-minute workout you can do in your room that improves focus and energy all day.', url: '#', source: 'FitStudent', published_at: new Date().toISOString() },
  ],
  literature: [
    { title: 'Young Author Publishes First Novel at Age 14', description: 'A 14-year-old from Chicago published her debut novel, which quickly became a bestseller.', url: '#', source: 'BookWorld', published_at: new Date().toISOString() },
    { title: 'School Poetry Contest Receives 10,000 Entries', description: 'Record participation in the national school poetry competition proves writing is alive and well.', url: '#', source: 'LitNews', published_at: new Date().toISOString() },
    { title: 'How Reading Fiction Makes You More Empathetic', description: 'Research shows regular fiction readers score higher on tests of emotional understanding.', url: '#', source: 'ReadingResearch', published_at: new Date().toISOString() },
  ],
  movies: [
    { title: 'Student Short Film Wins Sundance Youth Award', description: 'A 16-year-old director\'s 12-minute film took home the top youth prize at Sundance.', url: '#', source: 'FilmBuzz', published_at: new Date().toISOString() },
    { title: 'Behind the Scenes: How CGI Magic Is Made', description: 'Visual effects artists reveal the techniques behind Hollywood\'s most spectacular scenes.', url: '#', source: 'MovieMaker', published_at: new Date().toISOString() },
    { title: 'Classic Films Every Student Should Watch', description: 'Film teachers and critics recommend 10 timeless movies that changed cinema forever.', url: '#', source: 'CinemaEdu', published_at: new Date().toISOString() },
  ],
  travel: [
    { title: 'Exchange Programs Help Students Discover New Cultures', description: 'How student exchange programs broaden perspectives and build global friendships.', url: '#', source: 'TravelEdu', published_at: new Date().toISOString() },
    { title: 'Top 5 Educational Trips Schools Are Taking This Year', description: 'From Rome to Tokyo, field trips that combine adventure with real-world learning.', url: '#', source: 'SchoolTravel', published_at: new Date().toISOString() },
    { title: 'How Learning a Second Language Opens Doors Worldwide', description: 'Bilingual students share how speaking multiple languages changed their opportunities.', url: '#', source: 'GlobalEdu', published_at: new Date().toISOString() },
  ],
  food: [
    { title: 'School Cafeteria Goes Farm-to-Table', description: 'One district revamped its lunch program using locally sourced ingredients and saw health improve.', url: '#', source: 'FoodEdu', published_at: new Date().toISOString() },
    { title: 'Young Chef Wins National Cooking Competition', description: 'A 15-year-old from Texas impressed judges with a 3-course meal she designed herself.', url: '#', source: 'CookingKids', published_at: new Date().toISOString() },
    { title: 'How to Cook 5 Healthy Meals in Under 20 Minutes', description: 'Quick, nutritious recipes designed specifically for busy students and families.', url: '#', source: 'QuickEats', published_at: new Date().toISOString() },
  ],
  fashion: [
    { title: 'Students Design Sustainable Fashion Line', description: 'A high school fashion class created an entire clothing line using only recycled materials.', url: '#', source: 'EcoFashion', published_at: new Date().toISOString() },
    { title: 'How School Uniforms Are Being Redesigned for Comfort', description: 'New uniform designs prioritize student comfort and self-expression while maintaining standards.', url: '#', source: 'StyleEdu', published_at: new Date().toISOString() },
    { title: 'Teen Influencer Builds Fashion Brand with 2M Followers', description: 'A 17-year-old turned her passion for sustainable style into a thriving online brand.', url: '#', source: 'FashionNow', published_at: new Date().toISOString() },
  ],
  business: [
    { title: 'Teen Entrepreneur Raises $50K for Startup', description: 'A 16-year-old\'s app connecting students with tutors raised seed funding at a regional pitch contest.', url: '#', source: 'YoungBiz', published_at: new Date().toISOString() },
    { title: 'School Business Club Launches Real Store', description: 'Students run a fully operational school store to learn real-world business skills.', url: '#', source: 'BizEdu', published_at: new Date().toISOString() },
    { title: 'How to Start a Small Business While Still in School', description: 'Young entrepreneurs share their top advice for launching a business as a student.', url: '#', source: 'EntrepreneurKids', published_at: new Date().toISOString() },
  ],
};

router.get('/', (req: Request, res: Response) => {
  const u = (req as any).user as AuthPayload;
  const interests = db.prepare('SELECT category FROM interests WHERE user_id = ?').all(u.id) as any[];
  const categories = interests.map((i: any) => i.category);

  if (categories.length === 0) {
    // Return a mix of general categories
    const defaults = ['technology', 'science', 'sports', 'health'];
    const articles = defaults.flatMap(cat => (MOCK_NEWS[cat] || []).slice(0, 2));
    res.json({ articles, categories: defaults });
    return;
  }

  // Return 2-3 articles per interest category
  const articles = categories.flatMap((cat: string) => (MOCK_NEWS[cat] || []).slice(0, 2));
  res.json({ articles, categories });
});

export { MOCK_NEWS };
export default router;
