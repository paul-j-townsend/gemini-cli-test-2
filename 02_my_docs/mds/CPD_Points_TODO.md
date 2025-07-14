# CPD Points Calculation - TODO

## Current Implementation
The certificate currently uses this formula for CPD points:

```typescript
const calculateCPDPoints = () => {
  // Base: 1 point per 10 minutes of study time
  const basePoints = Math.floor(completion.time_spent / 600); // 1 point per 10 minutes
  // Bonus: +1 point if score ≥ 90%
  const scoreBonus = completion.percentage >= 90 ? 1 : 0;
  // Minimum: Always at least 1 CPD point
  return Math.max(1, basePoints + scoreBonus);
};
```

### Examples with Current System:
- 5 minutes, 100% score = 1 CPD point (0 base + 1 bonus, but minimum 1)
- 15 minutes, 100% score = 2 CPD points (1 base + 1 bonus)
- 25 minutes, 80% score = 2 CPD points (2 base + 0 bonus)
- 35 minutes, 95% score = 4 CPD points (3 base + 1 bonus)

## TODO: Review and Decide on Final CPD Points System

### Alternative Approaches to Consider:

1. **Fixed Points per Quiz**
   - Each quiz awards a predetermined number of CPD points
   - Simple and predictable
   - Could vary by quiz difficulty/topic

2. **Content-Based Points**
   - Points based on quiz content depth/complexity
   - Different topics might have different values
   - Could align with veterinary CPD requirements

3. **Time-Based Only**
   - Pure time spent studying (current base calculation)
   - Remove performance bonus
   - More straightforward

4. **Industry Standard Alignment**
   - Research veterinary CPD point standards
   - Align with RCVS or other veterinary body requirements
   - Ensure compliance with professional standards

5. **Hybrid Approach**
   - Combination of content difficulty + time + performance
   - More complex but potentially more accurate

## Questions to Resolve:
- [ ] What are the veterinary industry standards for CPD points?
- [ ] Should points vary by quiz topic/difficulty?
- [ ] Should performance (score) affect CPD points earned?
- [ ] What's the minimum/maximum points per quiz?
- [ ] Do regulatory bodies have specific requirements?

## Files to Update When Decided:
- `src/components/Certificate.tsx` - Certificate display logic
- `src/types/database.ts` - Potentially add CPD points to QuizCompletion interface
- Documentation for users explaining how CPD points are calculated