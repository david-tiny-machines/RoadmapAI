import { useState, useEffect } from 'react';
import { Initiative } from '../../types/initiative';
import { CapacityData } from '../../types/capacity';
import { getNextNMonths, getDefaultCapacity } from '../../utils/dateUtils';

const INITIATIVES_KEY = 'roadmapai_initiatives';
const CAPACITY_KEY = 'roadmapai_capacity';

// ... rest of the file content ... 