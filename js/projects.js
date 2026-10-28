export const contacts = {
  email: 'jayraldtajanlangit123@gmail.com',
  github: 'https://github.com/jayraldtajanlangit',
  linkedin: 'https://www.linkedin.com/in/jayrald-tajanlangit-b8646a280/',
};

export const site = {
  name: 'Jayrald Tajanlangit',
  positioning: 'Computer Science student · Web & mobile development',
  location: 'Philippines',
  education: { program: 'Computer Science', school: 'University of San Jose Recoletos' },
};

function mediaFor(slug, {
  width,
  height,
  caption,
  disclosure,
  stills,
  label = 'Real app capture',
}) {
  return {
    available: true,
    status: 'available',
    poster: `assets/images/projects/${slug}/poster.webp`,
    video: `assets/videos/${slug}${height > width ? '-polished' : ''}.webm`,
    width,
    height,
    aspect: `${width} / ${height}`,
    orientation: height > width ? 'portrait' : 'landscape',
    caption,
    disclosure,
    label,
    stills: stills.map((still, index) => ({
      ...still,
      src: `assets/images/projects/${slug}/still-${String(index + 1).padStart(2, '0')}.webp`,
    })),
  };
}

export const projects = [
  {
    slug: 'maistra',
    title: 'mAIstra',
    folio: '01 / Learning systems',
    platform: 'Web and mobile application',
    summary:
      'A web and mobile teaching system that extracts handwritten C code with OCR, supports teacher review, executes verified code, and records grades.',
    description:
      'mAIstra helps instructors work through handwritten C programming submissions, from the captured page to a recorded grade. Teachers can compare the image with extracted code, correct it, and run verified code against test cases before saving their assessment.',
    role: 'Team project · Submission review and grading',
    ownership:
      'Team project; Jayrald owned the web submissions, review, and grading interface, the Judge0 integration, and the Supabase data layer.',
    repositoryStatus: 'team',
    challenge:
      'Connect an instructor-facing review flow to remote code execution while keeping submission and grading state coherent.',
    contribution:
      'Built the web submissions, code-review, and grading interface; integrated Judge0 execution; and implemented the Supabase persistence layer.',
    architecture:
      'The Flutter app captures handwritten C submissions and uploads them to Supabase. A Python FastAPI service preprocesses the images with OpenCV and extracts code with PaddleOCR. Instructors review and verify the extracted code in Angular before running it against question test cases through Judge0 and saving the grade.',
    technologies: ['Angular 21', 'TypeScript', 'Flutter', 'Python', 'FastAPI', 'OpenCV', 'PaddleOCR', 'Supabase', 'Judge0'],
    outcome: {
      result: 'The instructor flow connects a handwritten submission, OCR-extracted code, teacher verification, execution results, and a recorded grade in one interface.',
      evidence: 'The captured sequence starts with an unprocessed handwritten submission, triggers extraction, displays a real local PaddleOCR result, verifies the code, and shows two accepted demo test cases with a recorded 100% grade.',
      limitation: 'OCR output comes from a real local run on an anonymous sample and is replayed in the interface with shortened waiting time. Submission storage and grading responses use isolated demo fixtures. Mobile capture is not shown, and this example does not establish general OCR accuracy, live-service reliability, or classroom adoption.',
    },
    systemFlow: [
      ['1. Capture and upload', 'The Flutter mobile app captures handwritten C code and uploads the submission image to Supabase for extraction and review.'],
      ['2. Prepare the image', 'The FastAPI OCR service uses OpenCV to resize the image, convert it to grayscale, and reduce noise before recognition.'],
      ['3. Extract with PaddleOCR', 'A PP-OCRv6 detector locates text, and a fine-tuned recognizer reads the handwriting. Low-confidence detections are filtered before the text is reconstructed.'],
      ['4. Reconstruct the code', 'Detected text is grouped into lines in reading order. Conservative cleanup corrects misread C keywords and include directives, and the extracted code is saved in Supabase.'],
      ['5. Review and verify', 'The Angular review interface places the image beside editable code. The teacher checks and corrects the extraction, with OCR output kept separate from verified code.'],
      ['6. Execute and grade', 'Verified code runs against the selected question\'s test cases through Judge0. Execution results return to the review interface, and the final grade is recorded in Supabase.'],
    ],
    decisionLedger: [
      {
        decision: 'Isolate remote execution behind a Judge0 integration boundary.',
        why: 'The review interface needed execution results without taking responsibility for running untrusted code itself.',
        tradeoff: 'The workflow depends on a remote execution service and must surface its failure states clearly.',
      },
      {
        decision: 'Use Supabase as the shared persistence layer for review and grading state.',
        why: 'Submission context and the resulting grade needed one source of truth across the review sequence.',
        tradeoff: 'Interface behavior stays coupled to the agreed data shape and access rules.',
      },
    ],
    repositoryDisclosure:
      'The pipeline describes the full team system: mobile capture and OCR extraction were developed by teammates. Jayrald\'s contribution covers web submission review, grading, Judge0 integration, and Supabase persistence.',
    decisions: [
      'Kept code execution behind a dedicated Judge0 integration boundary.',
      'Stored review and grading state in Supabase so the workflow shares one source of truth.',
    ],
    workflow: [
      'Open a handwritten submission and extract the code.',
      'Review the OCR output and verify the code.',
      'Run the code and record the grade.',
    ],
    media: mediaFor('maistra', {
      width: 1280,
      height: 720,
      caption: 'Handwritten submission → OCR extraction → teacher verification → demo grading.',
      disclosure:
        'Real Angular interface capture showing Extract now, the OCR result, teacher verification, and grading. The OCR result was produced by the local PaddleOCR service on an anonymous handwritten sample and is replayed with shortened waiting time. Storage and grading use isolated demo fixtures; Flutter mobile capture is not shown.',
      stills: [
        {
          alt: 'mAIstra handwritten submission beside an empty code panel and the Extract now button.',
          caption:
            'Extract the code — a handwritten submission starts with no extracted text. Extract now runs the OCR step before code can be verified.',
        },
        {
          alt: 'mAIstra review dialog showing the handwritten page beside its recognized C code in the read-only OCR panel.',
          caption:
            'Review the OCR output — the read-only panel preserves the extracted text beside the photograph while the teacher prepares separate verified code.',
        },
        {
          alt: 'mAIstra run and grade step showing two accepted test cases and a score of 100 percent.',
          caption:
            'Run and grade — isolated demo execution results return to the review surface, where two accepted test cases produce a recorded 100% score.',
        },
      ],
    }),
  },
  {
    slug: 'skyfire',
    title: 'SkyFire — Airline Booking System',
    folio: '02 / Reservation systems',
    platform: 'Web application',
    summary:
      'A full-stack airline booking application covering flight discovery, seats, add-ons, and booking management.',
    description:
      'SkyFire brings the reservation process into one flow: find a flight, choose a seat, add baggage or a meal, and review the total before confirming. The completed reservation appears in My Bookings with its reference, trip details, and booking status.',
    role: 'Individual project · Full-stack development',
    ownership: 'Solo project designed and implemented by Jayrald.',
    repositoryStatus: 'private',
    challenge:
      'Keep seat validation authoritative on the backend while carrying a user through a multi-step reservation flow.',
    contribution:
      'Designed and built the Angular client, Django backend, reservation workflow, and a transaction.atomic seat-validation boundary that expresses lock intent with select_for_update.',
    architecture:
      'An Angular booking client sends reservation requests to a Django API that validates and writes seat state inside transaction.atomic. The SQLite demo backend does not enforce SELECT FOR UPDATE row locks.',
    technologies: ['Angular 21', 'Django REST Framework', 'JWT', 'SQLite'],
    outcome: {
      result: 'The local booking flow carries a selected flight, seat, and add-ons through to a confirmed reservation in My Bookings.',
      evidence: 'The captured sequence shows flight selection, a configured booking, and the resulting reservation with its reference, seat, price, and status.',
      limitation: 'The demonstration uses seeded flights and a local account. SQLite does not enforce SELECT FOR UPDATE row locks, so this demo does not establish protection against concurrent seat conflicts.',
    },
    systemFlow: [
      ['Angular client', 'Guides search, seat choice, add-ons, confirmation, and booking review.'],
      ['Django REST API', 'Validates authenticated booking requests and coordinates reservation state.'],
      ['Transactional seat validation', 'Checks availability and writes the reservation inside one backend transaction boundary.'],
      ['SQLite record', 'Persists the confirmed booking for the My Bookings view.'],
    ],
    decisionLedger: [
      {
        decision: 'Put seat validation and the reservation write inside transaction.atomic, using select_for_update to express lock intent.',
        why: 'Availability must be checked by the backend at the point where the booking is written, rather than trusted from client state.',
        tradeoff: 'SQLite ignores SELECT FOR UPDATE, so the current demo cannot claim row-level conflict prevention; that guarantee requires a database backend that supports row locks.',
      },
      {
        decision: 'Keep the source repository private.',
        why: 'The project can still be explained through its architecture and captured booking flow without publishing the codebase.',
        tradeoff: 'Reviewers cannot inspect source, so this case study discloses that limitation directly.',
      },
    ],
    repositoryDisclosure:
      'Private solo repository. Source access is not offered publicly. The demo uses SQLite, so its select_for_update call documents the intended locking boundary without providing a row-lock guarantee.',
    decisions: [
      'Kept seat validation and reservation writes inside a backend transaction boundary; the SQLite demo does not provide row-level SELECT FOR UPDATE locking.',
      'Kept the repository private while documenting the architecture and interaction flow publicly.',
    ],
    workflow: [
      'Search available flights.',
      'Choose a seat and optional add-ons.',
      'Confirm the reservation and review it in My Bookings.',
    ],
    media: mediaFor('skyfire', {
      width: 1440,
      height: 900,
      caption: 'Flight selection to seat and add-ons, then confirmation in My Bookings.',
      disclosure:
        'Real capture of the working local booking flow, using seeded flights and a locally isolated account so no production customer data appears.',
      stills: [
        {
          alt: 'SkyFire flight search page with discounted Manila to Tokyo and Cebu to Seoul results.',
          caption:
            'Choose a flight — search controls, availability, cabin, and pricing stay together so the reservation starts with an explicit fare.',
        },
        {
          alt: 'SkyFire booking dialog with seat 1A selected, baggage options, meal preference, and total price.',
          caption:
            'Configure the trip — the booking step carries the selected seat, baggage, meal, and calculated total in one reviewable state.',
        },
        {
          alt: 'SkyFire My Bookings page showing the confirmed Manila to Tokyo reservation and booking reference.',
          caption:
            'Confirm the reservation — the completed write returns a booking reference, seat, add-ons, price, and status in My Bookings.',
        },
      ],
    }),
  },
  {
    slug: 'bulk-buying-companion',
    title: 'Bulk Buying Companion',
    folio: '03 / Cooperative commerce',
    platform: 'Mobile application',
    summary:
      'A mobile coordination tool for discovering nearby bulk deals, splitting quantities, and managing pickup and payment updates.',
    description:
      'Bulk Buying Companion helps people organize a shared purchase without losing track of individual shares. Participants can browse nearby offers on the Split Board, check the quantity and cost of a share, reserve a slot, and follow payment and pickup updates.',
    role: 'Team project · Mobile and backend development',
    ownership:
      'Team project; Jayrald delivered defined product slices across authentication, discovery, collaboration, and fulfillment.',
    repositoryStatus: 'team',
    challenge:
      'Coordinate location-aware group purchases while keeping reservations, payments, notifications, and pickup status current.',
    contribution:
      'Implemented authentication, the geolocation hub, Split Board search, realtime notifications and payment flows, profiles and purchase history, pickup and reporting tools, and the barcode extension. Receipt OCR was team work.',
    architecture:
      'A Flutter client uses Supabase for authenticated data and realtime updates, with geolocation and on-device scanning features supporting discovery and fulfillment.',
    technologies: ['Flutter', 'Supabase', 'Realtime', 'Geolocation', 'On-device ML'],
    outcome: {
      result: 'The Split Board flow lets a participant inspect a deal and reserve a share, then shows the updated capacity and cancellation action.',
      evidence: 'The captured rice-deal sequence moves from three open slots to two after reservation and exposes the participant payment state.',
      limitation: 'The walkthrough uses a locally isolated mock data source. It demonstrates interface behavior without verifying live payment processing, multi-user synchronization, or pickup completion.',
    },
    systemFlow: [
      ['Nearby hub', 'Uses location context to surface relevant group-purchase activity.'],
      ['Split Board', 'Lets a participant search offers and reserve a share of a bulk quantity.'],
      ['Supabase state', 'Keeps participant, payment, notification, and pickup records synchronized.'],
      ['Fulfillment tools', 'Carries the shared purchase through history, reporting, barcode, and pickup views.'],
    ],
    decisionLedger: [
      {
        decision: 'Use realtime updates for shared purchase state.',
        why: 'Reservations, payment updates, and pickup status are useful only when every participant sees current information.',
        tradeoff: 'The client has to reconcile network interruptions and event ordering instead of assuming a static record.',
      },
      {
        decision: 'Keep barcode recognition on the device.',
        why: 'The extension can identify an item at the point of use without adding a server round trip.',
        tradeoff: 'Recognition quality depends on device camera conditions and the supported barcode formats.',
      },
    ],
    repositoryDisclosure:
      'Team repository, not currently linked publicly. Jayrald\'s scope is listed above; receipt OCR belongs to the wider team rather than to him.',
    decisions: [
      'Used realtime updates for reservation, payment, and pickup state shared across participants.',
      'Kept barcode recognition on-device while treating receipt OCR as a separate team-owned capability.',
    ],
    workflow: [
      'Browse or search the Split Board.',
      'Open a nearby bulk deal and reserve a share.',
      'Track payment and pickup updates through notifications.',
    ],
    media: mediaFor('bulk-buying-companion', {
      width: 390,
      height: 844,
      caption: 'Split Board to a rice deal, then reserving a share in the group purchase.',
      disclosure:
        'Genuine Flutter interface captured with the repository\'s locally isolated mock data source. It demonstrates the implemented interaction states, not live participant data.',
      stills: [
        {
          alt: 'Bulk Buying Companion Split Board listing bottled water, rice, and detergent deals at Colon Street Hub.',
          caption:
            'Browse the Split Board — searchable deal cards expose share price, quantity, slot availability, and closing date from one mobile surface.',
        },
        {
          alt: 'Bulk Buying Companion rice deal detail showing a 180 peso share, three open slots, and a Reserve a slot button.',
          caption:
            'Inspect the rice deal — the detail view makes the participant\'s quantity, cost, capacity, pickup point, and payment state explicit before reservation.',
        },
        {
          alt: 'Bulk Buying Companion rice deal after reservation, with two slots open and a Cancel my slot action.',
          caption:
            'Reserve a share — locally isolated capture data updates the remaining capacity and exposes the participant\'s payment and cancellation state.',
        },
      ],
    }),
  },
  {
    slug: 'pulso',
    title: 'Pulso',
    folio: '04 / Community products',
    platform: 'Mobile application',
    summary:
      'A Flutter community app with account access, image posts, reactions, saved content, and personalized profiles.',
    description:
      'Pulso gives community members a place to share captioned images and keep up with one another. The mobile experience connects account access, posting, likes and bookmarks, and profile editing so members can publish, save, and revisit content in one app.',
    role: 'Team project · Mobile and backend development',
    ownership:
      'Team project; Jayrald established the application foundation and built major social and realtime product features.',
    repositoryStatus: 'team',
    challenge:
      'Give community interactions a responsive mobile experience backed by consistent authentication and realtime state.',
    contribution:
      'Built the Flutter scaffold, Supabase and Riverpod foundation, authentication, and major social, profile, saved-content, and realtime features.',
    architecture:
      'A Flutter client uses Riverpod for application state and Supabase for authentication, persisted social data, and realtime changes.',
    technologies: ['Flutter', 'Riverpod', 'Supabase', 'Realtime'],
    outcome: {
      result: 'Members can sign in, publish a captioned image post, interact with the feed, personalize their profile, and sign out.',
      evidence: 'The video opens on sign-in, previews the create-account screen, and signs in with a fictional demo account. It then creates an image post, likes and bookmarks it, updates the name, bio, and avatar, and signs out to the welcome screen.',
      limitation: 'The recording uses real Flutter screens and the browser image picker with isolated in-memory authentication, media storage, and social data. The create-account screen is previewed without registering a real account. Live authentication, email confirmation, uploads, persistence, and realtime delivery are not verified; unreleased direct messages remain outside this case study.',
    },
    systemFlow: [
      ['Flutter interface', 'Provides sign-in and registration screens, image selection and post previews, the community feed, and profile editing.'],
      ['Riverpod state', 'Coordinates the session, pending post images, reactions, bookmarks, and profile updates.'],
      ['Supabase services', 'Provides authentication, image storage, persisted social data, and realtime changes in the connected app.'],
      ['Profile and saved views', 'Bring together a member\'s avatar, name, bio, published image grid, and bookmarked content.'],
    ],
    decisionLedger: [
      {
        decision: 'Centralize feature state with Riverpod.',
        why: 'Feed, profile, authentication, and saved-content behavior share session and data dependencies.',
        tradeoff: 'Providers require deliberate boundaries so feature state does not become globally tangled.',
      },
      {
        decision: 'Demonstrate image posting and profile editing with isolated sample data.',
        why: 'The real screens can show image selection, publishing, and profile changes without using live community accounts.',
        tradeoff: 'This capture demonstrates interface and state changes; live storage and realtime delivery require separate verification. Unreleased direct messages remain omitted.',
      },
    ],
    repositoryDisclosure:
      'Public team repository. Jayrald built the app foundation and major social, profile, saved-content, and realtime features; unreleased direct messages are not presented as shipped.',
    decisions: [
      'Centralized client state in Riverpod to keep feed, profile, and saved-content behavior predictable.',
      'Demonstrates supported image-posting and profile features with local sample data; unreleased direct messages remain omitted.',
    ],
    workflow: [
      'Sign in or preview the create-account screen.',
      'Publish the image post, then like and save it.',
      'Update the profile name, bio, and avatar.',
    ],
    media: mediaFor('pulso', {
      width: 390,
      height: 844,
      caption: 'Sign in → share an image → edit the profile → sign out.',
      disclosure:
        'Real Flutter screens with isolated in-memory authentication, post, profile, and media storage. The walkthrough previews registration, signs in with a fictional local account, selects an image, publishes and interacts with the post, edits the profile/avatar, and signs out. No real account is registered and no live authentication or community services are contacted.',
      stills: [
        {
          alt: 'Pulso welcome and sign-in screen showing email and password fields, Sign in, and Create account.',
          caption:
            'Access an account — the walkthrough previews Create account, then returns to sign in with a fictional local demo account.',
        },
        {
          alt: 'Pulso feed showing the newly published image post with its caption, liked heart, and active bookmark.',
          caption:
            'Publish and interact — the image and caption appear together in the feed, where the member can like and bookmark the new post.',
        },
        {
          alt: 'Pulso demo profile showing the updated avatar, display name, bio, and published image in its post grid.',
          caption:
            'Personalize the profile — saved edits update the display name, bio, and avatar, while the published image appears in the member\'s post grid.',
        },
      ],
    }),
  },
  {
    slug: 'sige',
    title: 'Sige',
    folio: '05 / Accountability tools',
    platform: 'Mobile application',
    summary:
      'A mobile accountability coach that turns conversational guidance into a focused view of next actions.',
    description:
      'Sige connects a coaching conversation with the next practical step. Its implemented chat integration supports conversational guidance, while the Tasks and Insights UI prototypes explore how people could review planned actions, open task details, and acknowledge progress. The walkthrough shows the Tasks prototype.',
    role: 'Individual project · Mobile development',
    ownership: 'Solo project designed and implemented by Jayrald.',
    repositoryStatus: 'public',
    challenge:
      'Connect a coaching conversation to practical follow-through without presenting unfinished product surfaces as shipped features.',
    contribution:
      'Designed and built the Flutter coaching experience and its service-backed chat integration; designed Tasks and Insights as clearly labeled interface prototypes.',
    architecture:
      'A Flutter client uses Supabase and a FastAPI service to support the coaching conversation, with Groq generating responses and FCM available for notification delivery.',
    technologies: ['Flutter', 'Supabase', 'FastAPI', 'Groq', 'FCM'],
    outcome: {
      result: 'The Tasks interface prototype demonstrates a path from a planned action to its detail view and completion state.',
      evidence: 'The captured sequence opens a task, shows its rationale and schedule, and marks it done in the prototype.',
      limitation: 'Tasks and Insights remain UI prototypes. This walkthrough is not connected to a live task backend and does not demonstrate the separate chat integration or establish behavior change.',
    },
    systemFlow: [
      ['Flutter client', 'Collects a message or quick reply in the coaching conversation.'],
      ['FastAPI service', 'Receives the request and coordinates the service-backed response flow.'],
      ['Groq integration', 'Generates the coaching response returned to the active conversation.'],
      ['Accountability surfaces', 'Tasks and Insights demonstrate the intended follow-through as labeled UI prototypes.'],
    ],
    decisionLedger: [
      {
        decision: 'Keep the coaching exchange inside the active conversation.',
        why: 'Quick replies and generated responses need immediate context to feel actionable rather than detached.',
        tradeoff: 'The usefulness of the experience depends on service availability and careful response handling.',
      },
      {
        decision: 'Label Tasks and Insights as UI prototypes.',
        why: 'Their interface direction can be shown without implying that unfinished service behavior is live.',
        tradeoff: 'The demonstration is intentionally narrower than the planned product surface.',
      },
    ],
    repositoryDisclosure:
      'Public solo repository. The chat integration is implemented; Tasks and Insights are presented as UI prototypes, not completed live features.',
    decisions: [
      'Kept quick replies and coaching responses close to the active conversation.',
      'Labels Tasks and Insights as UI prototypes wherever live service behavior is not demonstrated.',
    ],
    workflow: [
      'Review the planned next actions in the Tasks UI prototype.',
      'Open a prototype task detail.',
      'Mark the prototype task done and review its completion state.',
    ],
    media: mediaFor('sige', {
      width: 390,
      height: 844,
      label: 'Tasks UI prototype',
      caption: 'Tasks UI prototype — open a task, mark it done, and review the completion state.',
      disclosure:
        'Tasks UI prototype captured from the Flutter project. This locally isolated sequence demonstrates the intended task list, detail, and completion states; it is not connected to a live task backend.',
      stills: [
        {
          alt: 'Sige Tasks UI prototype showing in-progress and planned student tasks.',
          caption:
            'Tasks UI prototype — the list organizes next actions by status and exposes the next concrete step for each item.',
        },
        {
          alt: 'Sige Tasks UI prototype detail page for an OS midterm reviewer with a Mark done action.',
          caption:
            'Open the prototype detail — rationale, schedule, and completion action are composed as one focused accountability surface.',
        },
        {
          alt: 'Sige Tasks UI prototype completion screen celebrating the finished OS midterm reviewer task.',
          caption:
            'Mark the prototype task done — the completion state acknowledges progress, records focused time, and offers a clear next step.',
        },
      ],
    }),
  },
];

export function getProject(slug) {
  return projects.find((project) => project.slug === slug);
}
