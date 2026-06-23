import tinyHomeImg from '../assets/tiny_home.png'
import velvetPillowImg from '../assets/velvet_pillow.png'
import pourOverImg from '../assets/pour_over.png'
import kitchenImg from '../assets/tiny_home_kitchen.png'
import deckViewImg from '../assets/mountain_view_deck.png'
import breweryImg from '../assets/riverside_brewery.png'
import hostPortraitImg from '../assets/host_portrait.png'

export const defaultPropertiesData = {
  'The Littleton Tiny Home': {
    name: 'The Littleton Tiny Home',
    location: 'White Mountains, New Hampshire',
    heroImage: tinyHomeImg,
    hostNames: 'Alex & Jordan',
    
    layouts: {
      unlocked: [
        { id: 'home-details', visible: true, label: 'Your home details' },
        { id: 'house-rules', visible: true, label: 'House rules' },
        { id: 'shop', visible: true, label: 'Shop your stay' },
        { id: 'about-hosts', visible: true, label: 'Your Hosts' },
        { id: 'guestbook', visible: true, label: 'Virtual guestbook' },
        { id: 'direct-booking', visible: true, label: 'Direct Booking' },
        { id: 'gallery', visible: true, label: 'Gallery' },
        { id: 'local-recos', visible: true, label: 'Local favorites' },
        { id: 'other-listings', visible: true, label: 'Our other places' }
      ],
      booking: [
        { id: 'direct-booking', visible: true, label: 'Direct Booking' },
        { id: 'guestbook', visible: true, label: 'Virtual guestbook' },
        { id: 'about-hosts', visible: true, label: 'Your Hosts' },
        { id: 'gallery', visible: true, label: 'Gallery' },
        { id: 'local-recos', visible: true, label: 'Local favorites' },
        { id: 'other-listings', visible: true, label: 'Other Listings' }
      ]
    },

    content: {
      'home-details': {
        previewItems: [
          { icon: '📶', label: 'Wi-Fi network', val: 'LittletonGuest' },
          { icon: '🔑', label: 'Password', val: 'mountains24' },
          { icon: '🕐', label: 'Check-out', val: '11:00 AM' },
          { icon: '🚗', label: 'Parking', val: 'Gravel drive' },
          { icon: '🗝️', label: 'Door code', val: '4829#' },
          { icon: '🗑️', label: 'Trash day', val: 'Thursday' }
        ],
        fullItems: [
          { icon: '📶', label: 'Wi-Fi network', val: 'LittletonGuest' },
          { icon: '🔑', label: 'Password', val: 'mountains24' },
          { icon: '🕐', label: 'Check-out', val: '11:00 AM' },
          { icon: '🚗', label: 'Parking', val: 'Gravel drive' },
          { icon: '🗝️', label: 'Door code', val: '4829#' },
          { icon: '🗑️', label: 'Trash day', val: 'Thursday' },
          { icon: '🔥', label: 'Firepit', val: 'Wood provided' },
          { icon: '🚿', label: 'Hot water', val: 'Tankless — unlimited' },
          { icon: '🌡️', label: 'Thermostat', val: 'Nest — 68°F default' },
          { icon: '📺', label: 'TV', val: 'Roku — use your login' },
          { icon: '🧺', label: 'Laundry', val: 'Washer/dryer in closet' },
          { icon: '☎️', label: 'Emergency', val: '911 — address posted' }
        ]
      },
      'house-rules': {
        rules: [
          'No smoking anywhere on the property — the firepit is outside only',
          'Pets welcome! Please keep them off the linen furniture',
          'Quiet hours after 10pm — neighbors are close',
          'Please start the dishwasher before you leave',
          'Lock the front door when you leave — it does not auto-lock',
          'No shoes inside please — shoe rack by the front door',
          'Firepit: douse with water when done, never leave unattended',
          'Garbage and recycling bins are behind the shed',
          'Please strip the bed linens on your last morning',
          'Report any damage or issues — no judgment, we appreciate honesty'
        ],
        previewCount: 4
      },
      'shop': {
        title: 'Love something here?',
        subtitle: 'Everything in the house is available to purchase — we earn a small commission at no extra cost to you.',
        items: [
          { img: pourOverImg, name: 'Fellow Stagg EKG Kettle', price: '$165.00' },
          { img: velvetPillowImg, name: 'Parachute Linen Pillow Set', price: '$89.00' },
          { emoji: '🕯️', name: 'Otherland Candle — Cedar', price: '$36.00' },
          { img: kitchenImg, name: 'Staub Cast Iron Dutch Oven', price: '$369.95' },
          { emoji: '🧴', name: 'Aesop Resurrection Hand Wash', price: '$40.00', hiddenPreview: true },
          { emoji: '☕', name: 'Chemex 6-Cup Pour-Over', price: '$44.95', hiddenPreview: true },
          { img: deckViewImg, name: 'Adirondack Cedar Chair', price: '$289.00', hiddenPreview: true },
          { emoji: '🛏️', name: 'Brooklinen Classic Sheet Set', price: '$149.00', hiddenPreview: true }
        ]
      },
      'about-hosts': {
        hostNames: 'Alex & Jordan',
        portrait: hostPortraitImg,
        shortBio: "We're a couple of nature lovers who left the city to build our dream tiny home. We can't wait to share our slice of heaven with you.",
        longBioParagraphs: [
          "We met while hiking the Appalachian Trail back in 2018 and immediately bonded over our shared love for the outdoors, good coffee, and minimalist living.",
          "After years of living in a cramped city apartment, we decided to take the plunge and build The Littleton Tiny Home. It was a labor of love (and a lot of YouTube tutorials), but we couldn't be happier with how it turned out.",
          "When we're not hosting, you can usually find us exploring new trails with our golden retriever, Barnaby, or trying to perfect our sourdough recipe."
        ],
        favorites: [
          { icon: '🥾', label: 'Favorite Trail', val: 'Franconia Ridge' },
          { icon: '☕', label: 'Morning Routine', val: 'Pour-over on the deck' },
          { icon: '🎵', label: 'Currently Listening', val: 'Noah Kahan' },
          { icon: '🍕', label: 'Post-Hike Meal', val: 'Schilling Beer Co.' }
        ],
        lifestyleImages: [
          { src: deckViewImg, alt: 'Enjoying the deck', span: true },
          { src: pourOverImg, alt: 'Morning coffee' },
          { src: kitchenImg, alt: 'Cooking' }
        ]
      },
      'gallery': {
        images: [
          { src: tinyHomeImg, alt: 'The Littleton Tiny Home exterior', span: true },
          { src: kitchenImg, alt: 'Cozy kitchen details' },
          { src: velvetPillowImg, alt: 'Comfortable interiors' },
          { src: deckViewImg, alt: 'Mountain views from the deck' },
          { src: pourOverImg, alt: 'Morning coffee ritual' }
        ]
      },
      'local-recos': {
        items: [
          { icon: '☕', name: "Polly's Pancake Parlor", desc: 'Classic NH breakfast, 10 min away. Get the blueberry stack.', tag: 'Best breakfast' },
          { icon: '🥾', name: 'Bald Mountain Trail', desc: 'Easy 2-mile loop with views of the Franconia Range.', tag: 'Hiking' },
          { icon: '🍕', name: 'Schilling Beer Co.', desc: 'Craft brewery with wood-fired pizza along the Ammonoosuc.', tag: 'Dinner' },
          { icon: '🏊', name: 'Franconia Falls', desc: 'Natural water slides and swimming holes. 25 min drive + short hike.', tag: 'Swimming', hiddenPreview: true },
          { icon: '🛒', name: 'Littleton Food Co-op', desc: 'Great local produce and prepared foods. 5 min drive.', tag: 'Groceries', hiddenPreview: true },
          { icon: '⛷️', name: 'Cannon Mountain', desc: 'Skiing in winter, aerial tramway year-round. 15 min drive.', tag: 'Adventure', hiddenPreview: true },
          { icon: '🎭', name: 'Colonial Theatre', desc: 'Beautifully restored 1915 movie palace. Check the schedule.', tag: 'Entertainment', hiddenPreview: true },
          { icon: '🧀', name: 'Harman\'s Cheese', desc: 'Aged cheddar sold from a barn since 1955. Worth the detour.', tag: 'Local gem', hiddenPreview: true }
        ]
      },
      'other-listings': {
        properties: [
          { img: breweryImg, name: 'The Riverside Loft', loc: 'Portland, ME', rating: '★ 4.93 · 61 reviews', price: 'From $145 / night' },
          { img: deckViewImg, name: 'The Summit Cabin', loc: 'Lincoln, NH', rating: '★ 4.98 · 42 reviews', price: 'From $189 / night' },
          { img: tinyHomeImg, name: 'The Littleton Tiny Home', loc: 'White Mountains, NH', rating: '★ 4.97 · 83 reviews', price: 'From $129 / night' }
        ]
      },
      'direct-booking': {
        badge: 'Enjoyed your stay?',
        title: 'Book Your Next Visit Direct',
        sub: 'Save 12% on your next stay — no service fees when you book with us directly',
        btnText: 'Book direct & save 12%'
      },
      'guestbook': {
        // Posts can still be local to GuestView, but let's assume global
      }
    }
  }
}
