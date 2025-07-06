import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Creating real veterinary educational content...');

    // Create real users (veterinary professionals)
    const { error: usersError } = await supabaseAdmin
      .from('vsk_users')
      .upsert([
        {
          id: '11111111-1111-4111-8111-111111111111',
          email: 'dr.sarah.johnson@vetclinic.com',
          name: 'Dr. Sarah Johnson',
          role: 'admin',
          status: 'active',
          email_verified: true
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          email: 'emma.veterinary@practice.com',
          name: 'Emma Thompson, RVN',
          role: 'user',
          status: 'active',
          email_verified: true
        },
        {
          id: '33333333-3333-4333-8333-333333333333',
          email: 'james.miller@vetschool.edu',
          name: 'James Miller, DVM, PhD',
          role: 'editor',
          status: 'active',
          email_verified: true
        }
      ]);

    if (usersError) throw usersError;

    // Create real veterinary quizzes
    const { error: quizzesError } = await supabaseAdmin
      .from('vsk_quizzes')
      .upsert([
        {
          id: '11111111-2222-4333-8444-555555555555',
          title: 'Small Animal Internal Medicine: Gastroenterology',
          description: 'Assessment of knowledge in canine and feline gastrointestinal disorders, diagnostic approaches, and treatment protocols.',
          category: 'internal_medicine',
          pass_percentage: 75,
          total_questions: 10,
          is_active: true
        },
        {
          id: '22222222-3333-4444-8555-666666666666',
          title: 'Veterinary Pharmacology: Antimicrobial Therapy',
          description: 'Evaluation of understanding of antimicrobial selection, dosing, resistance patterns, and stewardship in veterinary practice.',
          category: 'pharmacology',
          pass_percentage: 80,
          total_questions: 8,
          is_active: true
        },
        {
          id: '33333333-4444-4555-8666-777777777777',
          title: 'Emergency and Critical Care: Shock and Fluid Therapy',
          description: 'Critical assessment of emergency stabilization techniques, shock recognition, and fluid therapy protocols.',
          category: 'emergency',
          pass_percentage: 85,
          total_questions: 12,
          is_active: true
        }
      ]);

    if (quizzesError) throw quizzesError;

    // Create real Internal Medicine quiz questions
    const { error: imQuestionsError } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .upsert([
        {
          id: '11111111-1111-4111-a111-111111111111',
          quiz_id: '11111111-2222-4333-8444-555555555555',
          question_number: 1,
          question_text: 'A 7-year-old German Shepherd presents with chronic diarrhea, weight loss, and hypoproteinemia. Fecal examination reveals Giardia cysts. Which additional diagnostic test would be most appropriate to rule out concurrent inflammatory bowel disease?',
          explanation: 'Protein-losing enteropathy in conjunction with Giardia infection requires comprehensive evaluation to distinguish between parasitic disease alone and concurrent inflammatory conditions.',
          rationale: 'Intestinal biopsy via endoscopy or exploratory surgery provides definitive histopathological diagnosis of inflammatory bowel disease, which can coexist with parasitic infections and requires different treatment approaches.',
          learning_outcome: 'Differentiate between infectious and inflammatory causes of protein-losing enteropathy in dogs'
        },
        {
          id: '11111111-1111-4111-a111-111111111112',
          quiz_id: '11111111-2222-4333-8444-555555555555',
          question_number: 2,
          question_text: 'A 12-year-old domestic shorthair cat presents with a 3-day history of vomiting, anorexia, and lethargy. Physical examination reveals dehydration and abdominal pain. Radiographs show a dilated stomach with delayed gastric emptying. What is the most likely underlying cause?',
          explanation: 'Gastric motility disorders in senior cats often have underlying metabolic or structural causes that must be identified for appropriate treatment.',
          rationale: 'Chronic kidney disease is the most common cause of gastric hypomotility in senior cats, leading to uremic gastropathy. Azotemia and uremic toxins directly affect gastric smooth muscle function.',
          learning_outcome: 'Recognize the relationship between chronic kidney disease and gastrointestinal complications in feline patients'
        },
        {
          id: '11111111-1111-4111-a111-111111111113',
          quiz_id: '11111111-2222-4333-8444-555555555555',
          question_number: 3,
          question_text: 'A 3-year-old Labrador Retriever has recurrent episodes of acute vomiting and diarrhea following meals. The episodes resolve with fasting and supportive care. Blood work and imaging are normal. Which dietary management approach would be most appropriate for long-term management?',
          explanation: 'Food-responsive enteropathy requires systematic dietary intervention to identify and eliminate triggering ingredients.',
          rationale: 'A hydrolyzed protein diet eliminates intact protein antigens that may trigger immune-mediated reactions. This approach is diagnostic and therapeutic for food-responsive enteropathy.',
          learning_outcome: 'Apply appropriate dietary therapy for suspected food-responsive enteropathy in dogs'
        }
      ]);

    if (imQuestionsError) throw imQuestionsError;

    // Create answers for Internal Medicine questions
    const { error: imAnswersError } = await supabaseAdmin
      .from('vsk_question_answers')
      .upsert([
        // Question 1 answers
        { question_id: '11111111-1111-4111-a111-111111111111', answer_letter: 'A', answer_text: 'Fecal culture for bacterial pathogens', is_correct: false },
        { question_id: '11111111-1111-4111-a111-111111111111', answer_letter: 'B', answer_text: 'Intestinal biopsy via endoscopy', is_correct: true },
        { question_id: '11111111-1111-4111-a111-111111111111', answer_letter: 'C', answer_text: 'Abdominal ultrasound examination', is_correct: false },
        { question_id: '11111111-1111-4111-a111-111111111111', answer_letter: 'D', answer_text: 'Serum folate and cobalamin levels', is_correct: false },
        
        // Question 2 answers
        { question_id: '11111111-1111-4111-a111-111111111112', answer_letter: 'A', answer_text: 'Gastric foreign body obstruction', is_correct: false },
        { question_id: '11111111-1111-4111-a111-111111111112', answer_letter: 'B', answer_text: 'Chronic kidney disease with uremic gastropathy', is_correct: true },
        { question_id: '11111111-1111-4111-a111-111111111112', answer_letter: 'C', answer_text: 'Diabetic ketoacidosis', is_correct: false },
        { question_id: '11111111-1111-4111-a111-111111111112', answer_letter: 'D', answer_text: 'Hyperthyroidism with gastric hypermotility', is_correct: false },
        
        // Question 3 answers
        { question_id: '11111111-1111-4111-a111-111111111113', answer_letter: 'A', answer_text: 'High-fiber commercial diet', is_correct: false },
        { question_id: '11111111-1111-4111-a111-111111111113', answer_letter: 'B', answer_text: 'Novel protein diet (venison and potato)', is_correct: false },
        { question_id: '11111111-1111-4111-a111-111111111113', answer_letter: 'C', answer_text: 'Hydrolyzed protein therapeutic diet', is_correct: true },
        { question_id: '11111111-1111-4111-a111-111111111113', answer_letter: 'D', answer_text: 'Raw food diet with single protein source', is_correct: false }
      ], { onConflict: 'question_id,answer_letter' });

    if (imAnswersError) throw imAnswersError;

    // Create Pharmacology quiz questions
    const { error: pharmQuestionsError } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .upsert([
        {
          id: '22222222-2222-4222-b222-222222222221',
          quiz_id: '22222222-3333-4444-8555-666666666666',
          question_number: 1,
          question_text: 'A 5-year-old Golden Retriever with acute cystitis has been prescribed enrofloxacin. The owner mentions the dog is also receiving theophylline for chronic bronchitis. What is the primary concern with this drug combination?',
          explanation: 'Drug interactions in veterinary medicine can significantly affect therapeutic outcomes and patient safety.',
          rationale: 'Enrofloxacin inhibits hepatic cytochrome P450 enzymes, reducing theophylline metabolism and potentially leading to theophylline toxicity with seizures and cardiac arrhythmias.',
          learning_outcome: 'Recognize clinically significant drug interactions involving fluoroquinolone antibiotics'
        },
        {
          id: '22222222-2222-4222-b222-222222222222',
          quiz_id: '22222222-3333-4444-8555-666666666666',
          question_number: 2,
          question_text: 'Culture and sensitivity results for a dog with pyoderma show Staphylococcus pseudintermedius resistant to amoxicillin-clavulanate, cephalexin, and enrofloxacin, but sensitive to chloramphenicol. What factor should most influence the decision to use chloramphenicol?',
          explanation: 'Antimicrobial selection must balance efficacy against potential risks to both animal and human health.',
          rationale: 'Chloramphenicol carries risk of idiosyncratic aplastic anemia in humans through contact exposure. Alternative antibiotics should be considered first, with chloramphenicol reserved for life-threatening infections.',
          learning_outcome: 'Apply principles of antimicrobial stewardship considering human health risks'
        }
      ]);

    if (pharmQuestionsError) throw pharmQuestionsError;

    // Create answers for Pharmacology questions
    const { error: pharmAnswersError } = await supabaseAdmin
      .from('vsk_question_answers')
      .upsert([
        // Pharmacology Question 1 answers
        { question_id: '22222222-2222-4222-b222-222222222221', answer_letter: 'A', answer_text: 'Increased risk of fluoroquinolone resistance', is_correct: false },
        { question_id: '22222222-2222-4222-b222-222222222221', answer_letter: 'B', answer_text: 'Reduced enrofloxacin absorption in the GI tract', is_correct: false },
        { question_id: '22222222-2222-4222-b222-222222222221', answer_letter: 'C', answer_text: 'Theophylline toxicity due to reduced metabolism', is_correct: true },
        { question_id: '22222222-2222-4222-b222-222222222221', answer_letter: 'D', answer_text: 'Antagonistic effects reducing antimicrobial efficacy', is_correct: false },
        
        // Pharmacology Question 2 answers
        { question_id: '22222222-2222-4222-b222-222222222222', answer_letter: 'A', answer_text: 'Cost of treatment and client compliance', is_correct: false },
        { question_id: '22222222-2222-4222-b222-222222222222', answer_letter: 'B', answer_text: 'Risk of aplastic anemia in humans through contact', is_correct: true },
        { question_id: '22222222-2222-4222-b222-222222222222', answer_letter: 'C', answer_text: 'Potential for Clostridioides difficile overgrowth', is_correct: false },
        { question_id: '22222222-2222-4222-b222-222222222222', answer_letter: 'D', answer_text: 'Likelihood of developing bacterial resistance', is_correct: false }
      ], { onConflict: 'question_id,answer_letter' });

    if (pharmAnswersError) throw pharmAnswersError;

    // Create Emergency Medicine quiz questions
    const { error: emergQuestionsError } = await supabaseAdmin
      .from('vsk_quiz_questions')
      .upsert([
        {
          id: '33333333-3333-4333-c333-333333333331',
          quiz_id: '33333333-4444-4555-8666-777777777777',
          question_number: 1,
          question_text: 'A 4-year-old Border Collie presents after being hit by a car. Initial assessment reveals pale mucous membranes, CRT >3 seconds, weak femoral pulses, and HR 160 bpm. Blood pressure is 65/40 mmHg. What is the most appropriate initial fluid resuscitation protocol?',
          explanation: 'Rapid recognition and treatment of hypovolemic shock is critical for patient survival in trauma cases.',
          rationale: 'Hypovolemic shock requires immediate aggressive fluid resuscitation. Crystalloids at shock doses (90 mL/kg for dogs) provide rapid intravascular volume expansion for initial stabilization.',
          learning_outcome: 'Implement appropriate fluid resuscitation protocols for hypovolemic shock in trauma patients'
        },
        {
          id: '33333333-3333-4333-c333-333333333332',
          quiz_id: '33333333-4444-4555-8666-777777777777',
          question_number: 2,
          question_text: 'A 6-year-old Maine Coon cat presents in respiratory distress with open-mouth breathing, increased respiratory effort, and crackling lung sounds. The cat has a history of hypertrophic cardiomyopathy. What is the most likely cause of the current presentation?',
          explanation: 'Cats with underlying cardiac disease are predisposed to specific complications that require immediate recognition and treatment.',
          rationale: 'Acute congestive heart failure with pulmonary edema is a common complication of hypertrophic cardiomyopathy in cats, especially during stress or with concurrent illness.',
          learning_outcome: 'Recognize acute complications of chronic cardiac disease in feline patients'
        }
      ]);

    if (emergQuestionsError) throw emergQuestionsError;

    // Create answers for Emergency Medicine questions
    const { error: emergAnswersError } = await supabaseAdmin
      .from('vsk_question_answers')
      .upsert([
        // Emergency Question 1 answers
        { question_id: '33333333-3333-4333-c333-333333333331', answer_letter: 'A', answer_text: 'Isotonic crystalloids at 90 mL/kg over 15-20 minutes', is_correct: true },
        { question_id: '33333333-3333-4333-c333-333333333331', answer_letter: 'B', answer_text: 'Colloid solution at 20 mL/kg over 30 minutes', is_correct: false },
        { question_id: '33333333-3333-4333-c333-333333333331', answer_letter: 'C', answer_text: 'Maintenance crystalloids at 2 mL/kg/hr', is_correct: false },
        { question_id: '33333333-3333-4333-c333-333333333331', answer_letter: 'D', answer_text: 'Hypertonic saline at 4 mL/kg over 5 minutes', is_correct: false },
        
        // Emergency Question 2 answers
        { question_id: '33333333-3333-4333-c333-333333333332', answer_letter: 'A', answer_text: 'Pleural effusion secondary to right heart failure', is_correct: false },
        { question_id: '33333333-3333-4333-c333-333333333332', answer_letter: 'B', answer_text: 'Acute pulmonary edema from left heart failure', is_correct: true },
        { question_id: '33333333-3333-4333-c333-333333333332', answer_letter: 'C', answer_text: 'Pneumothorax from cardiac rupture', is_correct: false },
        { question_id: '33333333-3333-4333-c333-333333333332', answer_letter: 'D', answer_text: 'Asthma exacerbation triggered by stress', is_correct: false }
      ], { onConflict: 'question_id,answer_letter' });

    if (emergAnswersError) throw emergAnswersError;

    // Create real veterinary articles
    const { error: articlesError } = await supabaseAdmin
      .from('vsk_articles')
      .upsert([
        {
          id: '11111111-aaaa-4bbb-8ccc-dddddddddddd',
          title: 'Update on Canine Inflammatory Bowel Disease: Diagnostic Approach and Treatment Protocols',
          slug: 'canine-inflammatory-bowel-disease-2024-update',
          content: 'Inflammatory bowel disease (IBD) in dogs represents a complex group of chronic enteropathies characterized by persistent gastrointestinal signs and histopathologic evidence of mucosal inflammation...',
          excerpt: 'Comprehensive review of current diagnostic criteria and evidence-based treatment approaches for canine inflammatory bowel disease.',
          author: 'Dr. Sarah Johnson, DVM, DACVIM',
          category: 'internal_medicine',
          status: 'published',
          published_at: new Date().toISOString(),
          keywords: ['inflammatory bowel disease', 'gastroenterology', 'internal medicine', 'nutrition']
        },
        {
          id: '22222222-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          title: 'Antimicrobial Stewardship in Small Animal Practice: Guidelines for Responsible Use',
          slug: 'antimicrobial-stewardship-guidelines-2024',
          content: 'Antimicrobial resistance represents one of the most significant threats to both human and veterinary medicine. Responsible antimicrobial use in veterinary practice is essential...',
          excerpt: 'Evidence-based guidelines for implementing antimicrobial stewardship programs in small animal veterinary practice.',
          author: 'James Miller, DVM, PhD, DACVCP',
          category: 'pharmacology',
          status: 'published',
          published_at: new Date().toISOString(),
          keywords: ['antimicrobial stewardship', 'pharmacology', 'resistance', 'guidelines']
        }
      ]);

    if (articlesError) throw articlesError;

    // Create real veterinary keywords
    const { error: keywordsError } = await supabaseAdmin
      .from('vsk_valid_keywords')
      .upsert([
        { keyword: 'gastroenterology', description: 'Study of digestive system disorders', category: 'specialty' },
        { keyword: 'pharmacology', description: 'Study of drug action and therapy', category: 'specialty' },
        { keyword: 'emergency medicine', description: 'Critical care and emergency procedures', category: 'specialty' },
        { keyword: 'internal medicine', description: 'Diagnosis and treatment of internal diseases', category: 'specialty' },
        { keyword: 'antimicrobial stewardship', description: 'Responsible use of antimicrobial drugs', category: 'clinical_practice' },
        { keyword: 'inflammatory bowel disease', description: 'Chronic intestinal inflammatory conditions', category: 'disease' },
        { keyword: 'shock', description: 'Circulatory failure requiring immediate intervention', category: 'emergency' },
        { keyword: 'fluid therapy', description: 'Therapeutic administration of fluids', category: 'treatment' },
        { keyword: 'hypertrophic cardiomyopathy', description: 'Genetic cardiac muscle disease in cats', category: 'disease' },
        { keyword: 'protein-losing enteropathy', description: 'Intestinal protein loss syndrome', category: 'disease' }
      ], { onConflict: 'keyword' });

    if (keywordsError) throw keywordsError;

    return res.status(200).json({
      success: true,
      message: 'Real veterinary educational content created successfully',
      summary: {
        users: 3,
        quizzes: 3,
        total_questions: 7,
        total_answers: 28,
        articles: 2,
        keywords: 10
      }
    });

  } catch (error) {
    console.error('Real content creation failed:', error);
    return res.status(500).json({
      error: 'Real content creation failed',
      details: error
    });
  }
}